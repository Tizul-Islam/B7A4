import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";

const getGearList = async (queryParams: any) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    brand,
    isAvailable,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(category);
    if (isUuid) {
      where.categoryId = category;
    } else {
      where.category = {
        name: { contains: category, mode: "insensitive" },
      };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerDay = {};
    if (minPrice !== undefined) {
      where.pricePerDay.gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined) {
      where.pricePerDay.lte = parseFloat(maxPrice);
    }
  }

  if (brand) {
    where.brand = { contains: brand, mode: "insensitive" };
  }

  if (isAvailable !== undefined) {
    const availableBool = isAvailable === "true" || isAvailable === true;
    where.isAvailable = availableBool;
  }

  if (queryParams.providerId) {
    where.providerId = queryParams.providerId;
  }

  const [total, gearItems] = await prisma.$transaction([
    prisma.gearItem.count({ where }),
    prisma.gearItem.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: {
          select: { id: true, name: true },
        },
        provider: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: gearItems,
  };
};

const getGearDetails = async (id: string) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true },
      },
      provider: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear item not found.");
  }

  return gearItem;
};

const createGear = async (providerId: string, payload: any) => {
  const {
    name,
    description,
    brand,
    categoryId,
    images,
    pricePerDay,
    stockQuantity,
    condition,
    isAvailable = true,
  } = payload;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new AppError(404, "Category not found.");
  }

  const gearItem = await prisma.gearItem.create({
    data: {
      providerId,
      categoryId,
      name,
      description,
      brand,
      images,
      pricePerDay,
      stockQuantity,
      availableQuantity: stockQuantity,
      condition,
      isAvailable,
    },
    include: {
      category: { select: { name: true } },
    },
  });

  return gearItem;
};

const updateGear = async (id: string, providerId: string, payload: any) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear item not found.");
  }

  if (gearItem.providerId !== providerId) {
    throw new AppError(403, "You do not have permission to modify this gear listing.");
  }

  const {
    name,
    description,
    brand,
    categoryId,
    images,
    pricePerDay,
    stockQuantity,
    condition,
    isAvailable,
  } = payload;

  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      throw new AppError(404, "Category not found.");
    }
  }

  let updatedAvailableQuantity = gearItem.availableQuantity;
  if (stockQuantity !== undefined) {
    const currentRented = gearItem.stockQuantity - gearItem.availableQuantity;
    updatedAvailableQuantity = stockQuantity - currentRented;

    if (updatedAvailableQuantity < 0) {
      throw new AppError(400, "Cannot reduce stockQuantity below the number of currently active rentals.");
    }
  }

  const updatedGear = await prisma.gearItem.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(brand !== undefined && { brand }),
      ...(categoryId !== undefined && { categoryId }),
      ...(images !== undefined && { images }),
      ...(pricePerDay !== undefined && { pricePerDay }),
      ...(stockQuantity !== undefined && { stockQuantity, availableQuantity: updatedAvailableQuantity }),
      ...(condition !== undefined && { condition }),
      ...(isAvailable !== undefined && { isAvailable }),
    },
  });

  return updatedGear;
};

const deleteGear = async (id: string, providerId: string) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear item not found.");
  }

  if (gearItem.providerId !== providerId) {
    throw new AppError(403, "You do not have permission to delete this gear listing.");
  }

  const activeRentals = await prisma.rentalOrder.count({
    where: {
      items: {
        some: { gearItemId: id },
      },
      status: {
        in: ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"],
      },
    },
  });

  if (activeRentals > 0) {
    throw new AppError(400, "Cannot delete gear item with active rental orders.");
  }

  await prisma.gearItem.delete({
    where: { id },
  });

  return {};
};

export const gearService = {
  getGearList,
  getGearDetails,
  createGear,
  updateGear,
  deleteGear,
};
