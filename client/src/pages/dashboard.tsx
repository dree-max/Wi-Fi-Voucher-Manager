import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Ticket, 
  Users, 
  TrendingUp, 
  DollarSign,
  UserPlus,
  AlertTriangle
} from "lucide-react";
import UsageChart from "@/components/charts/usage-chart";
import VoucherDistribution from "@/components/charts/voucher-distribution";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Update page title through parent component
    const event = new CustomEvent('pageChange', {
      detail: {
        title: 'Dashboard Overview',
        subtitle: 'Monitor your WiFi voucher system performance'
      }
    });
    window.dispatchEvent(event);
  }, []);

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

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

  const statCards = [
    {
      title: "Active Vouchers",
      value: stats.activeVouchers || 0,
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: Ticket,
      color: "text-primary",
    },
    {
      title: "Connected Users",
      value: stats.connectedUsers || 0,
      change: "+5 in last hour",
      changeType: "positive" as const,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Data Usage Today",
      value: stats.dataUsageToday || "0 GB",
      change: "85% of limit",
      changeType: "warning" as const,
      icon: TrendingUp,
      color: "text-yellow-600",
    },
    {
      title: "Revenue Today",
      value: stats.revenueToday || "$0",
      change: "+18% vs yesterday",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-purple-600",
    },
  ];

  const recentActivities = [
    {
      type: "user_connected",
      title: "New user connected",
      description: "Voucher: WIFI-2024-ABC123 • 2 minutes ago",
      icon: UserPlus,
      iconColor: "text-green-600 bg-green-100",
    },
    {
      type: "voucher_created",
      title: "Voucher batch created",
      description: "50 Premium vouchers • 15 minutes ago",
      icon: Ticket,
      iconColor: "text-blue-600 bg-blue-100",
    },
    {
      type: "limit_exceeded",
      title: "Data limit exceeded",
      description: "User disconnected • 32 minutes ago",
      icon: AlertTriangle,
      iconColor: "text-red-600 bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-opacity-10 rounded-lg flex items-center justify-center ${stat.color.replace('text-', 'bg-')}`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Usage (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <UsageChart />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Voucher Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <VoucherDistribution />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <button 
            className="text-primary text-sm font-medium hover:text-primary/80"
            onClick={() => navigate('/sessions')}
          >
            View All
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconColor}`}>
                  <activity.icon size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
