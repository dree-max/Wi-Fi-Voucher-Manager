import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  RefreshCw, 
  Activity, 
  Gauge, 
  TrendingUp, 
  Clock,
  Smartphone,
  Laptop,
  Tablet,
  Monitor
} from "lucide-react";
import { formatBytes, getDeviceIcon } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Sessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const event = new CustomEvent('pageChange', {
      detail: {
        title: 'Active Sessions',
        subtitle: 'Monitor connected users and their network usage'
      }
    });
    window.dispatchEvent(event);
  }, []);

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/sessions/active"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: sessionStats = {} } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("POST", `/api/sessions/${sessionId}/disconnect`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User disconnected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getDeviceIconComponent = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
      case 'phone':
        return <Smartphone size={16} className="text-primary" />;
      case 'laptop':
        return <Laptop size={16} className="text-secondary" />;
      case 'tablet':
        return <Tablet size={16} className="text-purple-600" />;
      case 'desktop':
        return <Monitor size={16} className="text-gray-600" />;
      default:
        return <Monitor size={16} className="text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          <p className="text-sm text-gray-500">Monitor connected users and their network usage</p>
        </div>
        <Button onClick={() => refetch()} className="flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {sessionStats.connectedUsers || sessions.length}
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <Activity className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bandwidth Used</p>
                <p className="text-2xl font-bold text-yellow-600">2.4 Mbps</p>
              </div>
              <Gauge className="text-yellow-600" size={32} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peak Today</p>
                <p className="text-2xl font-bold text-primary">
                  {sessionStats.peakToday || 156}
                </p>
              </div>
              <TrendingUp className="text-primary" size={32} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-700">
                  {sessionStats.avgDuration || '1.2h'}
                </p>
              </div>
              <Clock className="text-gray-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Voucher</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead>Data Used</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No active sessions
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session: any) => {
                    const dataUsedPercent = session.voucher?.plan?.dataLimit 
                      ? (session.dataUsed / session.voucher.plan.dataLimit) * 100
                      : 0;
                    
                    const timeConnected = Math.floor(
                      (new Date().getTime() - new Date(session.startTime).getTime()) / (1000 * 60)
                    );
                    
                    return (
                      <TableRow key={session.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                              {getDeviceIconComponent(session.deviceType)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {session.ipAddress}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {session.deviceType || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-sm text-gray-900">
                            {session.voucher?.code || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {timeConnected}m ago
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {formatBytes(session.dataUsed * 1024 * 1024)} / {' '}
                            {session.voucher?.plan?.dataLimit 
                              ? formatBytes(session.voucher.plan.dataLimit * 1024 * 1024)
                              : 'Unlimited'
                            }
                          </div>
                          {session.voucher?.plan?.dataLimit && (
                            <Progress value={dataUsedPercent} className="w-full mt-1" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {session.voucher?.plan?.duration 
                            ? `${Math.max(0, session.voucher.plan.duration - timeConnected)}m`
                            : 'Unlimited'
                          }
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          <div>↓ 2.1 Mbps</div>
                          <div>↑ 0.8 Mbps</div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => disconnectMutation.mutate(session.id)}
                            disabled={disconnectMutation.isPending}
                          >
                            Disconnect
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
