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
} from 'chart.js';
import { Sale, StockMovement, Product, SaleReturn } from './types';

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
  Filler
);

// Chart theme configuration matching existing CSS variables
export const chartTheme = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    color: '#374151',
    grid: {
      color: 'rgba(0, 0, 0, 0.1)',
    },
    tick: {
      color: '#6b7280',
    },
  },
  dark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#f3f4f6',
    grid: {
      color: 'rgba(255, 255, 255, 0.1)',
    },
    tick: {
      color: '#9ca3af',
    },
  },
};

// Chart colors using CSS custom properties
export const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

// Common chart options
export const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        color: 'var(--foreground)',
      },
    },
    tooltip: {
      backgroundColor: 'var(--card)',
      titleColor: 'var(--foreground)',
      bodyColor: 'var(--foreground)',
      borderColor: 'var(--border)',
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
        color: 'var(--foreground)',
      },
    },
    y: {
      grid: {
        color: 'var(--border)',
      },
      ticks: {
        color: 'var(--foreground)',
      },
    },
  },
};

// Utility functions for data transformation
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

// Data aggregation utilities
export const aggregateByPeriod = (
  data: any[],
  dateField: string,
  valueField: string,
  period: 'daily' | 'weekly' | 'monthly' = 'monthly'
) => {
  const grouped: { [key: string]: number } = {};

  data.forEach(item => {
    const date = new Date(item[dateField]);
    let key: string;

    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
  valueField: string
) => {
  const grouped: { [key: string]: number } = {};

  data.forEach(item => {
    const category = item[categoryField] || 'Unknown';
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
export const processSalesTrendData = (sales: Sale[], period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (period === 'monthly') {
    const monthlyData = months.map((month, index) => {
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === index && saleDate.getFullYear() === new Date().getFullYear();
      });

      return {
        month,
        sales: monthSales.length,
        revenue: monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      };
    });

    return monthlyData;
  }

  // For daily/weekly, aggregate by period
  const aggregated = aggregateByPeriod(sales, 'date', 'totalAmount', period);
  return aggregated.map(item => ({
    period: item.period,
    sales: sales.filter(sale => {
      const saleDate = new Date(sale.date);
      let key: string;

      switch (period) {
        case 'daily':
          key = saleDate.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(saleDate);
          weekStart.setDate(saleDate.getDate() - saleDate.getDay());
          key = weekStart.toISOString().split('T')[0];
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
  product.customCategory?.trim() || product.category?.trim() || 'Other';

const getPeriodRange = (
  period: 'daily' | 'weekly' | 'monthly',
) => {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'daily':
      return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
    case 'weekly':
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date() };
    case 'monthly':
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
  metric: 'sales' | 'revenue',
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
) => {
  const range = getPeriodRange(period);
  const categoryPerformance: Record<string, { sales: number; revenue: number }> = {};

  sales.forEach((sale) => {
    if (!isWithinRange(sale.date, range.start, range.end)) return;

    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId || p._id === item.productId);
      const category = getProductCategory(product ?? ({ category: 'Other' } as Product));

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
        movement.type === 'out' &&
        movement.reason?.toLowerCase().includes('damage'),
    )
    .reduce((sum, movement) => sum + getStockMovementLossValue(movement, products), 0);

  const expiryLosses = stockMovements
    .filter(
      (movement) =>
        movement.type === 'out' &&
        movement.reason?.toLowerCase().includes('expir'),
    )
    .reduce((sum, movement) => sum + getStockMovementLossValue(movement, products), 0);

  const theftLosses = stockMovements
    .filter(
      (movement) =>
        movement.type === 'out' &&
        movement.reason?.toLowerCase().includes('theft'),
    )
    .reduce((sum, movement) => sum + getStockMovementLossValue(movement, products), 0);

  // Calculate losses from returns
  const returnLosses = saleReturns
    .filter((returnItem) => returnItem.status === 'completed')
    .reduce((sum, returnItem) => sum + returnItem.totalAmount, 0);

  const totalLosses = damageLosses + expiryLosses + theftLosses + returnLosses;
  const otherLosses = Math.max(0, totalLosses * 0.1); // Assume 10% other losses

  const losses = [
    { reason: 'Damage', value: damageLosses },
    { reason: 'Expiry', value: expiryLosses },
    { reason: 'Theft', value: theftLosses },
    { reason: 'Returns', value: returnLosses },
    { reason: 'Other', value: otherLosses },
  ].filter(loss => loss.value > 0);

  const total = losses.reduce((sum, loss) => sum + loss.value, 0);

  return losses.map(loss => ({
    ...loss,
    percentage: total > 0 ? Math.round((loss.value / total) * 100) : 0,
  }));
};

export const processProductPerformanceData = (sales: Sale[], products: Product[]) => {
  const productSales: { [key: string]: { sales: number; revenue: number } } = {};

  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
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

export const processKPIData = (sales: Sale[], products: Product[], stockMovements: StockMovement[]) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const previousMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevYear;
  });

  const currentRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const previousRevenue = previousMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const currentSalesCount = currentMonthSales.length;
  const previousSalesCount = previousMonthSales.length;
  const salesChange = previousSalesCount > 0 ? ((currentSalesCount - previousSalesCount) / previousSalesCount) * 100 : 0;

  const totalInventory = products.reduce((sum, product) => sum + product.currentStock, 0);
  const lowStockProducts = products.filter(product => product.currentStock <= product.reorderLevel).length;

  const totalLosses = stockMovements
    .filter(
      (movement) =>
        movement.type === 'out' &&
        ['damage', 'expiry', 'theft'].some((reason) =>
          movement.reason?.toLowerCase().includes(reason),
        ),
    )
    .reduce((sum, movement) => sum + getStockMovementLossValue(movement, products), 0);

  return {
    revenue: { value: currentRevenue, change: revenueChange },
    sales: { value: currentSalesCount, change: salesChange },
    inventory: { value: totalInventory, lowStock: lowStockProducts },
    losses: { value: totalLosses },
  };
};

// Generate mock data for development
export const generateMockData = {
  salesTrend: () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      sales: Math.floor(Math.random() * 50000) + 20000,
      revenue: Math.floor(Math.random() * 100000) + 50000,
    }));
  },

  topProducts: () => [
    { name: 'Wireless Headphones', sales: 1250, revenue: 187500 },
    { name: 'Bluetooth Speaker', sales: 980, revenue: 117600 },
    { name: 'Smart Watch', sales: 750, revenue: 225000 },
    { name: 'Laptop Stand', sales: 620, revenue: 31000 },
    { name: 'USB Cable', sales: 540, revenue: 5400 },
  ],

  lossesByReason: () => [
    { reason: 'Damage', value: 12500, percentage: 45 },
    { reason: 'Expiry', value: 8750, percentage: 32 },
    { reason: 'Theft', value: 4375, percentage: 16 },
    { reason: 'Other', value: 2188, percentage: 7 },
  ],
};