import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";

const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateUserStatus = async (id: string, activeStatus: any) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (user.role === "ADMIN") {
    throw new AppError(400, "Cannot suspend an administrator account.");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { activeStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
    },
  });

  return updatedUser;
};

const getGearListings = async () => {
  return await prisma.gearItem.findMany({
    include: {
      category: { select: { name: true } },
      provider: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getRentals = async () => {
  return await prisma.rentalOrder.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          gearItem: { select: { id: true, name: true, providerId: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
  const totalProviders = await prisma.user.count({ where: { role: "PROVIDER" } });
  const totalGearItems = await prisma.gearItem.count();
  const totalRentalOrders = await prisma.rentalOrder.count();

  const ordersGroup = await prisma.rentalOrder.groupBy({
    by: ["status"],
    _count: true,
  });

  const ordersByStatus = ordersGroup.reduce((acc: any, curr) => {
    acc[curr.status] = curr._count;
    return acc;
  }, {});

  const statuses = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP", "RETURNED", "CANCELLED"];
  statuses.forEach((s) => {
    if (!ordersByStatus[s]) {
      ordersByStatus[s] = 0;
    }
  });

  const totalPaymentsCompleted = await prisma.payment.count({
    where: { status: "COMPLETED" },
  });

  const revenueResult = await prisma.payment.aggregate({
    where: { status: "COMPLETED" },
    _sum: {
      amount: true,
    },
  });

  const totalRevenue = Number(revenueResult._sum.amount || 0);

  return {
    totalUsers,
    totalCustomers,
    totalProviders,
    totalGearItems,
    totalRentalOrders,
    ordersByStatus,
    totalPaymentsCompleted,
    totalRevenue,
  };
};

export const adminService = {
  getUsers,
  updateUserStatus,
  getGearListings,
  getRentals,
  getStats,
};
