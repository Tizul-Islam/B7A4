import Stripe from "stripe";
import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import { stripe } from "../../lib/stripe.js";
import config from "../../config/index.js";

const createPaymentIntent = async (customerId: string, payload: any) => {
  const { rentalOrderId, method } = payload;

  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
  });

  if (!order) {
    throw new AppError(404, "Rental order not found.");
  }

  if (order.customerId !== customerId) {
    throw new AppError(403, "You do not have permission to pay for this rental order.");
  }

  if (order.status !== "CONFIRMED") {
    throw new AppError(400, `Payment can only be created for CONFIRMED orders. Current status: ${order.status}`);
  }

  if (method === "STRIPE") {
    if (!stripe) {
      throw new AppError(500, "Stripe payment gateway is not configured. Please define STRIPE_SECRET_KEY in environment variables.");
    }
    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        rentalOrderId: order.id,
        customerId,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        transactionId: paymentIntent.id,
        rentalOrderId: order.id,
        amount: order.totalAmount,
        method: "STRIPE",
        status: "PENDING",
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      payment,
    };
  }

  if (method === "SSLCOMMERZ") {
    const transactionId = `ssl_${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        transactionId,
        rentalOrderId: order.id,
        amount: order.totalAmount,
        method: "SSLCOMMERZ",
        status: "PENDING",
      },
    });

    return {
      gatewayPageURL: `https://sandbox.sslcommerz.com/gwprocess/v4/api.php?transactionId=${transactionId}`,
      payment,
    };
  }

  throw new AppError(400, "Unsupported payment method");
};

const confirmPaymentWebhook = async (rawBody: Buffer, signature: string) => {
  if (!stripe) {
    throw new AppError(500, "Stripe payment gateway is not configured.");
  }
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret
    );
  } catch (err: any) {
    throw new AppError(400, `Webhook signature verification failed: ${err.message}`);
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const rentalOrderId = paymentIntent.metadata?.rentalOrderId;

  if (event.type === "payment_intent.succeeded") {
    if (!rentalOrderId) {
      throw new AppError(400, "No rentalOrderId found in payment metadata");
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      await tx.rentalOrder.update({
        where: { id: rentalOrderId },
        data: {
          status: "PAID",
        },
      });
    });

    console.log(`Payment succeeded for order ${rentalOrderId}`);
  } else if (event.type === "payment_intent.payment_failed") {
    await prisma.payment.updateMany({
      where: { transactionId: paymentIntent.id },
      data: {
        status: "FAILED",
      },
    });
    console.log(`Payment failed for intent ${paymentIntent.id}`);
  }

  return { received: true };
};

const getPaymentHistory = async (userId: string, role: string) => {
  let where: any = {};

  if (role === "CUSTOMER") {
    where.rentalOrder = { customerId: userId };
  } else if (role === "PROVIDER") {
    where.rentalOrder = {
      items: {
        some: { gearItem: { providerId: userId } },
      },
    };
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      rentalOrder: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          totalAmount: true,
          status: true,
          customerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

const getPaymentDetails = async (id: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalOrder: {
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found.");
  }

  const isOwner = (payment as any).rentalOrder.customerId === userId;
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "You do not have permission to view this payment details.");
  }

  return payment;
};

export const paymentService = {
  createPaymentIntent,
  confirmPaymentWebhook,
  getPaymentHistory,
  getPaymentDetails,
};
