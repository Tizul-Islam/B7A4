import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";

const createReview = async (customerId: string, payload: any) => {
  const { rentalOrderId, gearItemId, rating, comment } = payload;

  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
  });

  if (!order) {
    throw new AppError(404, "Rental order not found.");
  }

  if (order.customerId !== customerId) {
    throw new AppError(403, "You do not have permission to review items from this order.");
  }

  if (order.status !== "RETURNED") {
    throw new AppError(400, "You can only submit a review after the gear has been returned.");
  }

  const hasItem = await prisma.rentalOrderItem.findFirst({
    where: {
      rentalOrderId,
      gearItemId,
    },
  });

  if (!hasItem) {
    throw new AppError(400, "The specified gear item was not part of this rental order.");
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      customerId,
      rentalOrderId,
      gearItemId,
    },
  });

  if (existingReview) {
    throw new AppError(409, "You have already submitted a review for this item and order combination.");
  }

  const review = await prisma.review.create({
    data: {
      customerId,
      rentalOrderId,
      gearItemId,
      rating,
      comment,
    },
    include: {
      customer: { select: { name: true } },
      gearItem: { select: { name: true } },
    },
  });

  return review;
};

const getGearReviews = async (gearItemId: string) => {
  const gearExists = await prisma.gearItem.findUnique({
    where: { id: gearItemId },
  });

  if (!gearExists) {
    throw new AppError(404, "Gear item not found.");
  }

  const reviews = await prisma.review.findMany({
    where: { gearItemId },
    include: {
      customer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

export const reviewService = {
  createReview,
  getGearReviews,
};
