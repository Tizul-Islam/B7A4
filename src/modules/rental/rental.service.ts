import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";

const createRental = async (customerId: string, payload: any) => {
  const { startDate, endDate, items } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    throw new AppError(400, "Rental duration must be at least 1 day.");
  }

  const result = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const gearItem = await tx.gearItem.findUnique({
        where: { id: item.gearItemId },
      });

      if (!gearItem) {
        throw new AppError(404, `Gear item with ID ${item.gearItemId} not found.`);
      }

      if (!gearItem.isAvailable) {
        throw new AppError(400, `Gear item '${gearItem.name}' is currently not available for rent.`);
      }

      if (gearItem.availableQuantity < item.quantity) {
        throw new AppError(
          400,
          `Insufficient stock for '${gearItem.name}'. Requested: ${item.quantity}, Available: ${gearItem.availableQuantity}`
        );
      }

      // Deduct available stock
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          availableQuantity: { decrement: item.quantity },
        },
      });

      const itemTotal = Number(gearItem.pricePerDay) * item.quantity * diffDays;
      totalAmount += itemTotal;

      orderItemsData.push({
        gearItemId: item.gearItemId,
        quantity: item.quantity,
        pricePerDay: gearItem.pricePerDay,
      });
    }

    const rentalOrder = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        status: "PLACED",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            gearItem: {
              select: { name: true, brand: true },
            },
          },
        },
      },
    });

    return rentalOrder;
  });

  return result;
};

const getRentals = async (userId: string, role: string) => {
  let where: any = {};

  if (role === "CUSTOMER") {
    where.customerId = userId;
  } else if (role === "PROVIDER") {
    where.items = {
      some: {
        gearItem: { providerId: userId },
      },
    };
  }

  const rentals = await prisma.rentalOrder.findMany({
    where,
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: {
        include: {
          gearItem: {
            select: { id: true, name: true, brand: true, providerId: true },
          },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rentals;
};

const getRentalDetails = async (id: string, userId: string, role: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: {
        include: {
          gearItem: true,
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw new AppError(404, "Rental order not found.");
  }

  const isOwner = order.customerId === userId;
  const isProvider = (order as any).items.some((item: any) => item.gearItem.providerId === userId);
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isProvider && !isAdmin) {
    throw new AppError(403, "You do not have permission to view this order.");
  }

  return order;
};

const getProviderOrders = async (providerId: string) => {
  const orders = await prisma.rentalOrder.findMany({
    where: {
      items: {
        some: {
          gearItem: { providerId },
        },
      },
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: {
        include: {
          gearItem: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
};

const updateOrderStatus = async (id: string, providerId: string, status: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          gearItem: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, "Rental order not found.");
  }

  const ownsGear = (order as any).items.some((item: any) => item.gearItem.providerId === providerId);
  if (!ownsGear) {
    throw new AppError(403, "You do not have permission to update the status of this order.");
  }

  const currentStatus = order.status;

  if (status === "CONFIRMED" && currentStatus !== "PLACED") {
    throw new AppError(400, `Cannot transition order status from ${currentStatus} to CONFIRMED.`);
  }

  if (status === "PICKED_UP" && currentStatus !== "PAID") {
    throw new AppError(400, `Cannot transition order status from ${currentStatus} to PICKED_UP. Order must be PAID first.`);
  }

  if (status === "RETURNED" && currentStatus !== "PICKED_UP") {
    throw new AppError(400, `Cannot transition order status from ${currentStatus} to RETURNED. Order must be PICKED_UP first.`);
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    if (status === "RETURNED") {
      for (const item of (order as any).items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: {
            availableQuantity: { increment: item.quantity },
          },
        });
      }
    }

    return await tx.rentalOrder.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: true,
      },
    });
  });

  return updatedOrder;
};

const cancelRental = async (id: string, userId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new AppError(404, "Rental order not found.");
  }

  if (order.customerId !== userId) {
    throw new AppError(403, "You do not have permission to cancel this order.");
  }

  if (order.status !== "PLACED") {
    throw new AppError(400, `Cannot cancel order at this stage. Current status is ${order.status}.`);
  }

  const cancelledOrder = await prisma.$transaction(async (tx) => {
    for (const item of (order as any).items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          availableQuantity: { increment: item.quantity },
        },
      });
    }

    return await tx.rentalOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  });

  return cancelledOrder;
};

export const rentalService = {
  createRental,
  getRentals,
  getRentalDetails,
  getProviderOrders,
  updateOrderStatus,
  cancelRental,
};
