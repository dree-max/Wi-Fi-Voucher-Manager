import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign 
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7");

  useEffect(() => {
    const event = new CustomEvent('pageChange', {
      detail: {
        title: 'Analytics & Reports',
        subtitle: 'Detailed insights into your WiFi network usage'
      }
    });
    window.dispatchEvent(event);
  }, []);

  const { data: analyticsData = [], isLoading } = useQuery({
    queryKey: ["/api/analytics", dateRange],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      return fetch(`/api/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .then(res => res.json());
    },
  });

  const analyticsCards = [
    {
      title: "Total Sessions",
      value: "12,456",
      change: "+23% vs last period",
      changeType: "positive" as const,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Data Consumed",
      value: "847 GB",
      change: "+12% vs last period",
      changeType: "warning" as const,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Avg Session Time",
      value: "1.8h",
      change: "+5% vs last period",
      changeType: "positive" as const,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Revenue",
      value: "$3,247",
      change: "+18% vs last period",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-purple-600",
    },
  ];

  const trendsChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sessions',
        data: [120, 190, 300, 500, 200, 300, 450],
        backgroundColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  const devicesChartData = {
    labels: ['Mobile', 'Laptop', 'Tablet', 'Desktop'],
    datasets: [
      {
        data: [55, 25, 15, 5],
        backgroundColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(99, 102, 241)',
        ],
      },
    ],
  };

  const peakHoursData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 9}${i + 9 < 12 ? 'AM' : 'PM'}`,
    usage: Math.floor(Math.random() * 100) + 10,
  }));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics & Reports</h3>
          <p className="text-sm text-gray-500">Detailed insights into your WiFi network usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button className="flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm ${
                    card.changeType === 'positive' ? 'text-green-600' : 
                    card.changeType === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-opacity-10 rounded-lg flex items-center justify-center ${card.color.replace('text-', 'bg-')}`}>
                  <card.icon className={card.color} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar options={chartOptions} data={trendsChartData} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Pie options={pieChartOptions} data={devicesChartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Usage Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Usage Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {peakHoursData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="h-16 bg-gray-100 rounded mb-2 relative">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded" 
                    style={{ height: `${data.usage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{data.hour}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
