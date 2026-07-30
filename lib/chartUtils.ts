import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Sale, StockMovement, Product, SaleReturn } from "./types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

// Chart theme configuration matching existing CSS variables
export const chartTheme = {
  light: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "rgba(0, 0, 0, 0.1)",
    color: "#374151",
    grid: {
      color: "rgba(0, 0, 0, 0.1)",
    },
    tick: {
      color: "#6b7280",
    },
  },
  dark: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    color: "#f3f4f6",
    grid: {
      color: "rgba(255, 255, 255, 0.1)",
    },
    tick: {
      color: "#9ca3af",
    },
  },
};

// Chart colors using CSS custom properties
export const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Common chart options builder
export const getCommonOptions = (theme: "light" | "dark" = "light") => {
  const selectedTheme = chartTheme[theme] ?? chartTheme.light;

  return {
    responsive: true,
    maintainAspectRatio: false,
    color: selectedTheme.color,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: selectedTheme.color,
        },
      },
      tooltip: {
        backgroundColor:
          theme === "dark"
            ? "rgba(15, 23, 42, 0.95)"
            : selectedTheme.backgroundColor,
        titleColor: selectedTheme.color,
        bodyColor: selectedTheme.color,
        labelTextColor: selectedTheme.color,
        borderColor: selectedTheme.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: selectedTheme.tick.color,
        },
      },
      y: {
        grid: {
          color: selectedTheme.grid.color,
        },
        ticks: {
          color: selectedTheme.tick.color,
        },
      },
    },
  };
};

// Utility functions for data transformation
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? "+" : ""}${Math.round(value)}%`;
};

export const parseDateValue = (date: string | Date): Date => {
  if (typeof date === "string") {
    const dateOnlyMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]) - 1;
      const day = Number(dateOnlyMatch[3]);
      return new Date(year, month, day);
    }
    return new Date(date);
  }
  return date;
};

export const getDateKey = (date: string | Date): string => {
  const dateObj = parseDateValue(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getSaleDate = (sale: Sale): Date => {
  if (sale.createdAt) {
    return new Date(sale.createdAt);
  }
  return parseDateValue(sale.date);
};

const getLatestDateValue = <T>(
  items: T[],
  getDate: (item: T) => string | Date | undefined,
): Date | undefined => {
  return items.reduce<Date | undefined>((latest, item) => {
    const value = getDate(item);
    if (!value) return latest;

    const parsedDate = parseDateValue(value);
    if (!latest || parsedDate > latest) {
      return parsedDate;
    }

    return latest;
  }, undefined);
};

export const getRecentDateKeys = (
  days: number,
  endDate = new Date(),
): string[] => {
  const keys: string[] = [];
  const current = new Date(endDate);
  current.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(current);
    date.setDate(current.getDate() - i);
    keys.push(getDateKey(date));
  }

  return keys;
};

export const calculatePercentChange = (
  current: number,
  previous: number,
): number => {
  // If both are zero or negligible, no change
  if (Math.abs(current) < 0.01 && Math.abs(previous) < 0.01) {
    return 0;
  }

  // When the previous period has no value, show a meaningful delta instead of a flat zero.
  // This keeps KPI badges informative when the current period has new activity.
  if (previous === 0) {
    return current > 0 ? 100 : current < 0 ? -100 : 0;
  }

  // Normal percentage change calculation
  return ((current - previous) / previous) * 100;
};

// Helper function to get the month with data (current or previous) for a collection
const getActiveMonthForData = <T>(
  items: T[],
  getDate: (item: T) => string | Date | undefined,
): { month: number; year: number } => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Check if current month has any data
  const currentMonthHasData = items.some((item) => {
    const itemDate = getDate(item);
    if (!itemDate) return false;
    const parsedDate = parseDateValue(itemDate);
    return (
      parsedDate.getMonth() === currentMonth &&
      parsedDate.getFullYear() === currentYear
    );
  });

  if (currentMonthHasData) {
    return { month: currentMonth, year: currentYear };
  }

  // Fall back to previous month if it has any data
  const previousMonthHasData = items.some((item) => {
    const itemDate = getDate(item);
    if (!itemDate) return false;
    const parsedDate = parseDateValue(itemDate);
    return (
      parsedDate.getMonth() === prevMonth &&
      parsedDate.getFullYear() === prevYear
    );
  });

  if (previousMonthHasData) {
    return { month: prevMonth, year: prevYear };
  }

  // Otherwise choose the latest available month in the data set
  const latestDate = getLatestDateValue(items, getDate);
  if (latestDate) {
    return { month: latestDate.getMonth(), year: latestDate.getFullYear() };
  }

  return { month: currentMonth, year: currentYear };
};

// Helper to get last day of a specific month
const getLastDayOfMonth = (month: number, year: number): Date => {
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const lastDay = new Date(nextYear, nextMonth, 0);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay;
};

export const getDailyRevenueTrend = (
  sales: Sale[],
  days = 7,
  endDate = new Date(),
): number[] => {
  const dateKeys = getRecentDateKeys(days, endDate);

  return dateKeys.map((key) =>
    sales
      .filter((sale) => {
        const dateValue = sale.date || sale.createdAt;
        return dateValue && getDateKey(dateValue) === key;
      })
      .reduce((sum, sale) => sum + sale.totalAmount, 0),
  );
};

export const getDailySalesCountTrend = (
  sales: Sale[],
  days = 7,
  endDate = new Date(),
): number[] => {
  const dateKeys = getRecentDateKeys(days, endDate);

  return dateKeys.map(
    (key) =>
      sales.filter((sale) => {
        const dateValue = sale.date || sale.createdAt;
        return dateValue && getDateKey(dateValue) === key;
      }).length,
  );
};

export const getDailyLossTrend = (
  stockMovements: StockMovement[],
  saleReturns: SaleReturn[],
  products: Product[],
  days = 7,
  endDate = new Date(),
): number[] => {
  const dateKeys = getRecentDateKeys(days, endDate);

  const relevantMovements = stockMovements.filter((movement) => {
    const createdAt = movement.createdAt;
    if (!createdAt) return false;
    return dateKeys.includes(getDateKey(createdAt));
  });

  const relevantReturns = saleReturns.filter((returnItem) => {
    const createdAt = returnItem.createdAt;
    if (!createdAt) return false;
    return dateKeys.includes(getDateKey(createdAt));
  });

  return dateKeys.map((key) => {
    const movementLoss = relevantMovements
      .filter((movement) => {
        const createdAt = movement.createdAt;
        return (
          !!createdAt &&
          getDateKey(createdAt) === key &&
          movement.type === "out" &&
          ["damage", "expiry", "theft"].some((reason) =>
            movement.reason?.toLowerCase().includes(reason),
          )
        );
      })
      .reduce(
        (sum, movement) => sum + getStockMovementLossValue(movement, products),
        0,
      );

    const returnLoss = relevantReturns
      .filter((returnItem) => {
        const createdAt = returnItem.createdAt;
        return (
          returnItem.status === "completed" &&
          !!createdAt &&
          getDateKey(createdAt) === key
        );
      })
      .reduce((sum, returnItem) => sum + returnItem.totalAmount, 0);

    return movementLoss + returnLoss;
  });
};

export const getDailyInventoryValueTrend = (
  products: Product[],
  stockMovements: StockMovement[],
  days = 7,
  endDate = new Date(),
): number[] => {
  const dateKeys = getRecentDateKeys(days, endDate);
  const currentInventoryValue = products.reduce(
    (sum, product) => sum + product.currentStock * product.unitPrice,
    0,
  );

  const movementsByDate: Record<string, { inbound: number; outbound: number }> =
    {};

  stockMovements.forEach((movement) => {
    if (!movement.createdAt) return;
    const key = getDateKey(movement.createdAt);
    if (!dateKeys.includes(key)) return;

    const product = products.find(
      (p) => p.id === movement.productId || p._id === movement.productId,
    );
    const value = (product?.unitPrice ?? 0) * movement.quantity;

    movementsByDate[key] = movementsByDate[key] || { inbound: 0, outbound: 0 };

    if (movement.type === "in") {
      movementsByDate[key].inbound += value;
    } else if (movement.type === "out") {
      movementsByDate[key].outbound += value;
    }
  });

  const values: number[] = [];
  let runningValue = currentInventoryValue;

  for (let index = dateKeys.length - 1; index >= 0; index--) {
    const key = dateKeys[index];
    values[index] = runningValue;
    const movementValues = movementsByDate[key] || { inbound: 0, outbound: 0 };
    runningValue += movementValues.outbound - movementValues.inbound;
  }

  return values;
};

// Data aggregation utilities
export const aggregateByPeriod = (
  data: any[],
  dateField: string,
  valueField: string,
  period: "daily" | "weekly" | "monthly" = "monthly",
) => {
  const grouped: { [key: string]: number } = {};

  data.forEach((item) => {
    const date = parseDateValue(item[dateField]);
    let key: string;

    switch (period) {
      case "daily":
        key = getDateKey(date);
        break;
      case "weekly":
        const dayOfWeek = date.getDay();
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
        weekStart.setHours(0, 0, 0, 0);
        key = getDateKey(weekStart);
        break;
      case "monthly":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
    }

    grouped[key] = (grouped[key] || 0) + (item[valueField] || 0);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({
      period,
      value,
    }));
};

export const aggregateByCategory = (
  data: any[],
  categoryField: string,
  valueField: string,
) => {
  const grouped: { [key: string]: number } = {};

  data.forEach((item) => {
    const category = item[categoryField] || "Unknown";
    grouped[category] = (grouped[category] || 0) + (item[valueField] || 0);
  });

  return Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .map(([category, value]) => ({
      category,
      value,
    }));
};

// Real data processing functions
const getHourLabel = (hour: number) => {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour < 12) return `${String(hour).padStart(2, "0")}:00 AM`;
  return `${String(hour - 12).padStart(2, "0")}:00 PM`;
};

export const processSalesTrendData = (
  sales: Sale[],
  period: "daily" | "weekly" | "monthly" = "monthly",
) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (period === "monthly") {
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((month, index) => {
      const monthSales = sales.filter((sale) => {
        const saleDate = getSaleDate(sale);
        return (
          saleDate.getUTCMonth() === index &&
          saleDate.getUTCFullYear() === currentYear
        );
      });

      return {
        month,
        sales: monthSales.length,
        revenue: monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      };
    });

    return monthlyData;
  }

  if (period === "daily") {
    const today = new Date();
    const currentDateKey = getLocalDateKey(today);
    const hours = Array.from({ length: 24 }, (_, index) => index); // 00:00 through 23:00

    return hours.map((hour) => {
      const hourlySales = sales.filter((sale) => {
        const saleDate = getSaleDate(sale);
        return (
          getLocalDateKey(saleDate) === currentDateKey &&
          saleDate.getHours() === hour
        );
      });

      return {
        hour,
        hourLabel: getHourLabel(hour),
        sales: hourlySales.length,
        revenue: hourlySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      };
    });
  }

  if (period === "weekly") {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const currentDay = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((currentDay + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    return weekDays.map((label, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const dayKey = getDateKey(day);
      const dailySales = sales.filter((sale) => {
        const saleDate = getSaleDate(sale);
        return getDateKey(saleDate) === dayKey;
      });

      return {
        dayLabel: label,
        sales: dailySales.length,
        revenue: dailySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      };
    });
  }

  // For weekly, aggregate by period using UTC-safe date keys
  const aggregated = aggregateByPeriod(sales, "date", "totalAmount", period);
  return aggregated.map((item) => ({
    period: item.period,
    sales: sales.filter((sale) => {
      const saleDate = getSaleDate(sale);
      let key: string;

      switch (period) {
        case "weekly":
          const dayOfWeek = saleDate.getUTCDay();
          const weekStart = new Date(saleDate);
          weekStart.setUTCDate(saleDate.getUTCDate() - ((dayOfWeek + 6) % 7));
          key = getDateKey(weekStart);
          break;
        default:
          return false;
      }

      return key === item.period;
    }).length,
    revenue: item.value,
  }));
};

const getProductCategory = (product: Product) =>
  product.customCategory?.trim() || product.category?.trim() || "Other";

const getPeriodRange = (period: "daily" | "weekly" | "monthly") => {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case "daily":
      return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
    case "weekly":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date() };
    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date() };
  }
};

const isWithinRange = (dateString: string, start: Date, end: Date) => {
  const date = new Date(dateString);
  return date >= start && date <= end;
};

export const processCategoryPerformanceData = (
  sales: Sale[],
  products: Product[],
  metric: "sales" | "revenue",
  period: "daily" | "weekly" | "monthly" = "monthly",
) => {
  const range = getPeriodRange(period);
  const categoryPerformance: Record<
    string,
    { sales: number; revenue: number }
  > = {};

  sales.forEach((sale) => {
    if (!isWithinRange(sale.date, range.start, range.end)) return;

    sale.items.forEach((item) => {
      const product = products.find(
        (p) => p.id === item.productId || p._id === item.productId,
      );
      const category = getProductCategory(
        product ?? ({ category: "Other" } as Product),
      );

      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { sales: 0, revenue: 0 };
      }

      categoryPerformance[category].sales += item.quantity;
      categoryPerformance[category].revenue += item.total;
    });
  });

  return Object.entries(categoryPerformance)
    .map(([category, data]) => ({
      category,
      sales: data.sales,
      revenue: data.revenue,
    }))
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 5);
};

export const getStockMovementLossValue = (
  movement: StockMovement,
  products: Product[],
) => {
  const product = products.find(
    (p) => p.id === movement.productId || (p as any)._id === movement.productId,
  );
  const unitCost = product?.costPrice ?? product?.unitPrice ?? 0;
  return movement.quantity * unitCost;
};

export const processLossAnalysisData = (
  stockMovements: StockMovement[],
  saleReturns: SaleReturn[],
  products: Product[],
) => {
  // Calculate losses from stock movements (out movements with damage reasons)
  const damageLosses = stockMovements
    .filter(
      (movement) =>
        movement.type === "out" &&
        movement.reason?.toLowerCase().includes("damage"),
    )
    .reduce(
      (sum, movement) => sum + getStockMovementLossValue(movement, products),
      0,
    );

  const expiryLosses = stockMovements
    .filter(
      (movement) =>
        movement.type === "out" &&
        movement.reason?.toLowerCase().includes("expir"),
    )
    .reduce(
      (sum, movement) => sum + getStockMovementLossValue(movement, products),
      0,
    );

  const theftLosses = stockMovements
    .filter(
      (movement) =>
        movement.type === "out" &&
        movement.reason?.toLowerCase().includes("theft"),
    )
    .reduce(
      (sum, movement) => sum + getStockMovementLossValue(movement, products),
      0,
    );

  // Calculate losses from returns
  const returnLosses = saleReturns
    .filter((returnItem) => returnItem.status === "completed")
    .reduce((sum, returnItem) => sum + returnItem.totalAmount, 0);

  const totalLosses = damageLosses + expiryLosses + theftLosses + returnLosses;
  const otherLosses = Math.max(0, totalLosses * 0.1); // Assume 10% other losses

  const losses = [
    { reason: "Damage", value: damageLosses },
    { reason: "Expiry", value: expiryLosses },
    { reason: "Theft", value: theftLosses },
    { reason: "Returns", value: returnLosses },
    { reason: "Other", value: otherLosses },
  ].filter((loss) => loss.value > 0);

  const total = losses.reduce((sum, loss) => sum + loss.value, 0);

  return losses.map((loss) => ({
    ...loss,
    percentage: total > 0 ? Math.round((loss.value / total) * 100) : 0,
  }));
};

export const processProductPerformanceData = (
  sales: Sale[],
  products: Product[],
) => {
  const productSales: { [key: string]: { sales: number; revenue: number } } =
    {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const productName = product.name;
        if (!productSales[productName]) {
          productSales[productName] = { sales: 0, revenue: 0 };
        }
        productSales[productName].sales += item.quantity;
        productSales[productName].revenue += item.total;
      }
    });
  });

  return Object.entries(productSales)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: data.revenue,
    }));
};

export const processKPIData = (
  sales: Sale[],
  products: Product[],
  stockMovements: StockMovement[],
) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getMonthItems = <T>(
    items: T[],
    getDate: (item: T) => Date | string | undefined,
    month: number,
    year: number,
  ) => {
    return items.filter((item) => {
      const itemDate = getDate(item);
      if (!itemDate) return false;
      const parsedDate = parseDateValue(itemDate);
      return (
        parsedDate.getMonth() === month && parsedDate.getFullYear() === year
      );
    });
  };

  // Strict current month and previous month filtering (no fallback to older periods)
  const currentMonthSales = getMonthItems(
    sales,
    (sale) => sale.date || sale.createdAt,
    currentMonth,
    currentYear,
  );
  const previousMonthSales = getMonthItems(
    sales,
    (sale) => sale.date || sale.createdAt,
    prevMonth,
    prevYear,
  );

  const currentRevenue = currentMonthSales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0,
  );
  const previousRevenue = previousMonthSales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0,
  );
  const revenueChange = calculatePercentChange(currentRevenue, previousRevenue);

  const currentSalesCount = currentMonthSales.length;
  const previousSalesCount = previousMonthSales.length;
  const salesChange = calculatePercentChange(
    currentSalesCount,
    previousSalesCount,
  );

  const currentInventoryValue = products.reduce(
    (sum, product) => sum + product.currentStock * product.unitPrice,
    0,
  );

  const currentMonthMovements = getMonthItems(
    stockMovements,
    (movement) => movement.createdAt,
    currentMonth,
    currentYear,
  );
  const previousMonthMovements = getMonthItems(
    stockMovements,
    (movement) => movement.createdAt,
    prevMonth,
    prevYear,
  );

  const inboundCurrentMonthValue = currentMonthMovements
    .filter((movement) => movement.type === "in")
    .reduce((sum, movement) => {
      const product = products.find(
        (p) => p.id === movement.productId || p._id === movement.productId,
      );
      return sum + (product?.unitPrice ?? 0) * movement.quantity;
    }, 0);

  const outboundCurrentMonthValue = currentMonthMovements
    .filter((movement) => movement.type === "out")
    .reduce((sum, movement) => {
      const product = products.find(
        (p) => p.id === movement.productId || p._id === movement.productId,
      );
      return sum + (product?.unitPrice ?? 0) * movement.quantity;
    }, 0);

  const inventoryValueAtMonthStart =
    currentInventoryValue -
    inboundCurrentMonthValue +
    outboundCurrentMonthValue;
  const inventoryChange = calculatePercentChange(
    currentInventoryValue,
    inventoryValueAtMonthStart,
  );

  const currentLosses = currentMonthMovements
    .filter(
      (movement) =>
        movement.type === "out" &&
        ["damage", "expiry", "theft"].some((reason) =>
          movement.reason?.toLowerCase().includes(reason),
        ),
    )
    .reduce(
      (sum, movement) => sum + getStockMovementLossValue(movement, products),
      0,
    );

  const previousLosses = previousMonthMovements
    .filter(
      (movement) =>
        movement.type === "out" &&
        ["damage", "expiry", "theft"].some((reason) =>
          movement.reason?.toLowerCase().includes(reason),
        ),
    )
    .reduce(
      (sum, movement) => sum + getStockMovementLossValue(movement, products),
      0,
    );

  const lossesChange = calculatePercentChange(currentLosses, previousLosses);

  return {
    revenue: { value: currentRevenue, change: revenueChange },
    sales: { value: currentSalesCount, change: salesChange },
    inventory: {
      value: currentInventoryValue,
      lowStock: products.filter(
        (product) => product.currentStock <= product.reorderLevel,
      ).length,
      change: inventoryChange,
    },
    losses: { value: currentLosses, change: lossesChange },
  };
};

export const processCategoryDistributionData = (
  products: Product[],
  metric: "count" | "stock_value" = "count",
) => {
  const categoryData: Record<
    string,
    { count: number; stockValue: number; products: Product[] }
  > = {};

  products.forEach((product) => {
    const category = getProductCategory(product);

    if (!categoryData[category]) {
      categoryData[category] = { count: 0, stockValue: 0, products: [] };
    }

    categoryData[category].count += 1;
    categoryData[category].stockValue +=
      product.currentStock * product.unitPrice;
    categoryData[category].products.push(product);
  });

  const totalValue = Object.values(categoryData).reduce(
    (sum, data) => sum + (metric === "count" ? data.count : data.stockValue),
    0,
  );

  return Object.entries(categoryData)
    .map(([category, data]) => ({
      category,
      value: metric === "count" ? data.count : data.stockValue,
      percentage:
        totalValue > 0
          ? ((metric === "count" ? data.count : data.stockValue) / totalValue) *
            100
          : 0,
      productCount: data.count,
      stockValue: data.stockValue,
    }))
    .sort((a, b) => b.value - a.value);
};

// Generate mock data for development
export const generateMockData = {
  salesTrend: () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month, index) => ({
      month,
      sales: Math.floor(Math.random() * 50000) + 20000,
      revenue: Math.floor(Math.random() * 100000) + 50000,
    }));
  },

  topProducts: () => [
    { name: "Wireless Headphones", sales: 1250, revenue: 187500 },
    { name: "Bluetooth Speaker", sales: 980, revenue: 117600 },
    { name: "Smart Watch", sales: 750, revenue: 225000 },
    { name: "Laptop Stand", sales: 620, revenue: 31000 },
    { name: "USB Cable", sales: 540, revenue: 5400 },
  ],

  lossesByReason: () => [
    { reason: "Damage", value: 12500, percentage: 45 },
    { reason: "Expiry", value: 8750, percentage: 32 },
    { reason: "Theft", value: 4375, percentage: 16 },
    { reason: "Other", value: 2188, percentage: 7 },
  ],
};
