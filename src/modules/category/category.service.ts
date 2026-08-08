import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";

const getCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

const createCategory = async (payload: any) => {
  const { name, description } = payload;

  const existingCategory = await prisma.category.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new AppError(409, `Category '${name}' already exists.`);
  }

  return await prisma.category.create({
    data: { name, description },
  });
};

const updateCategory = async (id: string, payload: any) => {
  const { name, description } = payload;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, "Category not found.");
  }

  if (name && name !== category.name) {
    const duplicate = await prisma.category.findUnique({
      where: { name },
    });
    if (duplicate) {
      throw new AppError(409, `Category '${name}' already exists.`);
    }
  }

  return await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, "Category not found.");
  }

  // Check if category is used by any GearItem
  const gearCount = await prisma.gearItem.count({
    where: { categoryId: id },
  });

  if (gearCount > 0) {
    throw new AppError(400, "Cannot delete category as it is currently associated with one or more gear items.");
  }

  await prisma.category.delete({
    where: { id },
  });

  return {};
};

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
