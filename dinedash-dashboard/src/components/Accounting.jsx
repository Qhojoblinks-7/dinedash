import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMoneyBillAlt, faChartLine, faCalendarAlt, faUtensils, faShoppingCart, faCoins } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import Button from './ui/Button';
import { BarChart } from './ui/Chart';
import { Select, SelectItem } from './ui/Select';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const EXPENSE_DATA = [
  { icon: faUtensils, name: 'Food Supplies', description: 'Ingredients and supplies', amount: 2450.00 },
  { icon: faCoins, name: 'Staff Salaries', description: 'Monthly payroll', amount: 3200.00 },
  { icon: faShoppingCart, name: 'Utilities', description: 'Electricity, water, gas', amount: 850.00 },
];

/**
 * Accounting component for displaying restaurant financial analytics
 */
const Accounting = () => {
  const [financials, setFinancials] = useState({
    total_revenue: 0,
    total_orders: 0,
    avg_order_value: 0,
    today_revenue: 0,
    daily_revenue: [],
    payment_breakdown: {},
    most_profitable: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [period, setPeriod] = useState('7days');

  // Calculate date range based on period
  const getDateRange = (selectedPeriod) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (selectedPeriod) {
      case '7days':
        startDate.setDate(today.getDate() - 6);
        break;
      case '30days':
        startDate.setDate(today.getDate() - 29);
        break;
      case '90days':
        startDate.setDate(today.getDate() - 89);
        break;
      case '1year':
        startDate.setFullYear(today.getFullYear() - 1);
        startDate.setDate(today.getDate() + 1);
        break;
      case 'custom':
        return dateRange;
      default:
        startDate.setDate(today.getDate() - 6);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const range = getDateRange(period);
        const params = new URLSearchParams();
        if (range.startDate) params.append('start_date', range.startDate);
        if (range.endDate) params.append('end_date', range.endDate);

        const response = await axios.get(`${API_BASE_URL}/api/orders/analytics/?${params}`);
        setFinancials(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load analytics data. Please try again.');
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, dateRange]);

  // Memoized chart data for performance
  const chartData = useMemo(() => {
    return Array.isArray(financials.daily_revenue)
      ? financials.daily_revenue.map((day) => ({
          label: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          value: selectedMetric === 'revenue' ? (day.revenue || 0) : (day.orders || 0)
        }))
      : [];
  }, [financials.daily_revenue, selectedMetric]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return EXPENSE_DATA.reduce((sum, expense) => sum + expense.amount, 0);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-lg text-red-600">{error}</div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 mb-72">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Accounting</h1>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod} className="w-[100px]">
            <SelectItem value="7days">7D</SelectItem>
            <SelectItem value="30days">30D</SelectItem>
            <SelectItem value="90days">90D</SelectItem>
            <SelectItem value="1year">1Y</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </Select>
          {period === 'custom' && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-2 py-1 border border-input rounded text-sm w-32"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-2 py-1 border border-input rounded text-sm w-32"
              />
            </div>
          )}
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-green-500 text-2xl font-bold">₵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₵{(financials.total_revenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FontAwesomeIcon icon={faChartLine} className="text-blue-500 text-lg" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{financials.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500 text-lg" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₵{(financials.avg_order_value || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <FontAwesomeIcon icon={faUtensils} className="text-orange-500 text-lg" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₵{(financials.today_revenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+12.5% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>
              Trend ({period === '7days' ? 'Last 7 Days' :
                      period === '30days' ? 'Last 30 Days' :
                      period === '90days' ? 'Last 90 Days' :
                      period === '1year' ? 'Last Year' :
                      'Custom Period'})
            </CardTitle>
            <CardDescription>
              {period === 'custom' && dateRange.startDate && dateRange.endDate
                ? `From ${dateRange.startDate} to ${dateRange.endDate}`
                : 'Daily performance over selected period'}
            </CardDescription>
          </div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric} className="w-[180px]">
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="orders">Orders</SelectItem>
          </Select>
        </CardHeader>
        <CardContent>
          <BarChart data={chartData} />
        </CardContent>
      </Card>

      {/* Payment Methods & Most Profitable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
            <CardDescription>Breakdown of revenue by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(financials.payment_breakdown || {}).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center p-3 rounded-lg border">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={method === 'cash' ? faMoneyBillAlt : faCreditCard}
                      className="text-muted-foreground mr-3"
                    />
                    <div>
                      <p className="font-medium capitalize">{method}</p>
                      <p className="text-sm text-muted-foreground">
                        {financials.total_revenue > 0 ? ((amount / financials.total_revenue) * 100).toFixed(1) : 0}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₵{(amount || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Profitable Meals</CardTitle>
            <CardDescription>Top 5 revenue-generating items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(financials.most_profitable || []).map((meal, index) => (
                <div key={meal?.id || index} className="flex justify-between items-center p-3 rounded-lg border">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-3">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{meal?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">High performer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₵{(meal?.revenue || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Performance overview for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{financials.total_orders || 0}</p>
              <p className="text-sm text-muted-foreground">Orders This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₵{(financials.total_revenue || 0).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Revenue This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">₵{(financials.avg_order_value || 0).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Tracking</CardTitle>
          <CardDescription>Monthly operating expenses breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {EXPENSE_DATA.map((expense, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg border">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={expense.icon} className="text-muted-foreground mr-3" />
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-sm text-muted-foreground">{expense.description}</p>
                  </div>
                </div>
                <p className="font-semibold">₵{expense.amount.toFixed(2)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/50">
              <div>
                <p className="font-medium">Net Profit</p>
                <p className="text-sm text-muted-foreground">Revenue minus expenses</p>
              </div>
              <p className="font-semibold text-green-600">₵{((financials.total_revenue || 0) - totalExpenses).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key metrics and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-medium text-green-800">Revenue Growth</h4>
              <p className="text-sm text-green-700">Your revenue has increased by 20.1% compared to last month. Keep up the excellent work!</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-800">Popular Items</h4>
              <p className="text-sm text-blue-700">Focus on promoting your top-selling items like {financials.most_profitable?.[0]?.name || 'popular dishes'} to maximize profits.</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <h4 className="font-medium text-purple-800">Order Value</h4>
              <p className="text-sm text-purple-700">Consider upselling techniques to increase average order value from ₵{(financials.avg_order_value || 0).toFixed(2)}.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounting;