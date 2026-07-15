import { randomUUID } from "crypto";
import Stripe from "stripe";
import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { ICreatePayment, IListQuery } from "./payment.validation";

const getPagination = (query: IListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit || "10", 10) || 10, 1),
    100,
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const createPaymentSession = async (
  customerId: string,
  role: string,
  payload: ICreatePayment,
) => {
  const { rentalOrderId } = payload;

  if (!rentalOrderId) {
    throw new AppError(400, "Rental order ID is required.");
  }

  if (!stripe) {
    throw new AppError(500, "Stripe is not configured.");
  }

  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: {
      customer: true,
      payments: true,
      items: {
        include: {
          gearItem: true,
        },
      },
    },
  });

  if (!rentalOrder) {
    throw new AppError(404, "Rental order not found.");
  }

  if (rentalOrder.customerId !== customerId && role !== "ADMIN") {
    throw new AppError(403, "You do not have access to this rental order.");
  }

  if (rentalOrder.status !== "CONFIRMED") {
    throw new AppError(
      400,
      `Rental order must be CONFIRMED to pay. Current status: ${rentalOrder.status}`,
    );
  }

  const existingPayment = rentalOrder.payments.some(
    (payment) => payment.status !== "FAILED",
  );

  if (existingPayment) {
    throw new AppError(400, "A payment for this rental order already exists.");
  }

  const transactionId = sessionIdFromOrder(rentalOrder.id);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Rental order ${rentalOrder.id}`,
          },
          unit_amount: Math.round(Number(rentalOrder.totalAmount) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      rentalOrderId: rentalOrder.id,
      transactionId,
    },
    success_url: `${config.stripe_success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: config.stripe_cancel_url,
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: session.id,
      rentalOrderId: rentalOrder.id,
      amount: rentalOrder.totalAmount,
      method: "STRIPE",
      status: "PENDING",
    },
  });

  return { payment, checkoutUrl: session.url };
};

const sessionIdFromOrder = (rentalOrderId: string) =>
  `txn-${rentalOrderId}-${randomUUID()}`;

const markPaymentCompleted = async (sessionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: sessionId },
  });

  if (!payment || payment.status === "COMPLETED") return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", paidAt: new Date() },
    }),
    prisma.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: { status: "PAID" },
    }),
  ]);
};

const markPaymentFailed = async (sessionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: sessionId },
  });

  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });
};

const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  if (!stripe) {
    throw new AppError(500, "Stripe is not configured.");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret,
    );
  } catch (err) {
    throw new AppError(400, "Invalid Stripe webhook signature");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await markPaymentCompleted(session.id);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await markPaymentFailed(session.id);
      break;
    }
    default:
      break;
  }

  return { received: true };
};

const getMyPayments = async (customerId: string, query: IListQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where = { rentalOrder: { customerId } };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        rentalOrder: {
          include: {
            items: {
              include: {
                gearItem: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getPaymentById = async (customerId: string, id: string, role: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError(400, "Invalid payment ID format.");
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new AppError(404, "Payment not found.");
  }

  if (payment.rentalOrder.customerId !== customerId && role !== "ADMIN") {
    throw new AppError(403, "You do not have access to this payment.");
  }

  return payment;
};

const verifyPaymentSession = async (
  customerId: string,
  sessionId: string,
  role: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: sessionId },
    include: {
      rentalOrder: true,
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found.");
  }

  if (payment.rentalOrder.customerId !== customerId && role !== "ADMIN") {
    throw new AppError(403, "You do not have access to this payment.");
  }

  if (!stripe) {
    if (config.node_env === "development") {
      console.warn("Stripe is not configured. Automatically completing payment in development mode.");
      await markPaymentCompleted(sessionId);
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: { rentalOrder: true },
      });
      return updatedPayment;
    }
    throw new AppError(500, "Stripe is not configured.");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) {
    throw new AppError(404, "Stripe checkout session not found.");
  }

  if (session.payment_status === "paid") {
    await markPaymentCompleted(sessionId);
  } else if (session.status === "expired") {
    await markPaymentFailed(sessionId);
  }

  const updatedPayment = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: {
      rentalOrder: true,
    },
  });

  return updatedPayment;
};

export const paymentService = {
  createPaymentSession,
  handleStripeWebhook,
  getMyPayments,
  getPaymentById,
  verifyPaymentSession,
};
