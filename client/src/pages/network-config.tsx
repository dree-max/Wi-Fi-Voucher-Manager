import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wifi, 
  Router, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Network,
  Shield,
  Monitor
} from "lucide-react";

const networkConfigSchema = z.object({
  equipmentType: z.string().min(1, "Equipment type is required"),
  routerHost: z.string().min(1, "Router host is required"),
  routerPort: z.number().min(1).max(65535, "Port must be between 1 and 65535"),
  routerUsername: z.string().min(1, "Username is required"),
  routerPassword: z.string().min(1, "Password is required"),
  radiusSecret: z.string().min(1, "RADIUS secret is required"),
});

type NetworkConfigForm = z.infer<typeof networkConfigSchema>;

export default function NetworkConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');

  useEffect(() => {
    const event = new CustomEvent('pageChange', {
      detail: {
        title: 'Network Equipment',
        subtitle: 'Connect and configure your WiFi hardware'
      }
    });
    window.dispatchEvent(event);
  }, []);

  const { data: networkData, isLoading } = useQuery({
    queryKey: ["/api/network/config"],
  });

  const form = useForm<NetworkConfigForm>({
    resolver: zodResolver(networkConfigSchema),
    defaultValues: {
      equipmentType: "mikrotik_hap",
      routerHost: "192.168.1.1",
      routerPort: 8728,
      routerUsername: "admin",
      routerPassword: "",
      radiusSecret: "testing123",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (networkData?.currentConfig) {
      const config = networkData.currentConfig;
      form.reset({
        equipmentType: config.routerType === 'mikrotik' ? 'mikrotik_hap' : 
                     config.routerType === 'pfsense' ? 'pfsense_standard' : 'generic',
        routerHost: config.routerHost,
        routerPort: config.routerPort,
        routerUsername: config.routerUsername,
        routerPassword: "", // Don't populate password
        radiusSecret: "", // Don't populate secret
      });
    }
  }, [networkData, form]);

  const updateConfigMutation = useMutation({
    mutationFn: async (data: NetworkConfigForm) => {
      const response = await apiRequest("POST", "/api/network/config", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Network equipment configuration has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network/config"] });
    },
    onError: (error) => {
      toast({
        title: "Configuration Failed",
        description: "Failed to update network configuration. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/network/test-connection", {});
      return response.json();
    },
    onSuccess: (data) => {
      setConnectionStatus(data.success ? 'success' : 'failed');
      toast({
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: () => {
      setConnectionStatus('failed');
      toast({
        title: "Connection Test Failed",
        description: "Unable to test connection to network equipment.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NetworkConfigForm) => {
    updateConfigMutation.mutate(data);
  };

  const testConnection = () => {
    setConnectionStatus('testing');
    testConnectionMutation.mutate();
  };

  const getEquipmentInstructions = (type: string) => {
    const instructions: Record<string, string[]> = {
      mikrotik_hap: [
        "1. Connect to MikroTik router via Winbox or web interface",
        "2. Navigate to IP → Services → API",
        "3. Enable API service on port 8728",
        "4. Create hotspot on wireless interface",
        "5. Configure DNS redirection for captive portal",
        "6. Test API connectivity from this system"
      ],
      mikrotik_routerboard: [
        "1. Access RouterOS via SSH or Winbox",
        "2. Configure bridge interface for hotspot",
        "3. Set up hotspot server on bridge",
        "4. Enable API service and configure users",
        "5. Set bandwidth profiles for voucher types",
        "6. Configure captive portal redirection"
      ],
      pfsense_standard: [
        "1. Access pfSense web interface",
        "2. Navigate to Services → Captive Portal",
        "3. Enable captive portal on appropriate interface",
        "4. Configure voucher authentication",
        "5. Set up API credentials for remote management",
        "6. Test portal functionality"
      ],
      unifi_controller: [
        "1. Access UniFi Controller interface",
        "2. Configure guest network with portal",
        "3. Set up RADIUS authentication",
        "4. Create bandwidth profiles",
        "5. Enable API access",
        "6. Test integration"
      ],
    };
    
    return instructions[type] || ["Configure your equipment according to manufacturer guidelines"];
  };

  if (isLoading) {
    return <div>Loading network configuration...</div>;
  }

  const currentConfig = networkData?.currentConfig;
  const activeDevices = networkData?.activeDevices || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings size={16} />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Monitor size={16} />
            Status
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Router size={16} />
            Setup Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network size={20} />
                Network Equipment Configuration
              </CardTitle>
              <CardDescription>
                Configure connection to your WiFi router or access point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="equipmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your equipment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mikrotik_hap">MikroTik hAP (RouterOS)</SelectItem>
                            <SelectItem value="mikrotik_routerboard">MikroTik RouterBoard</SelectItem>
                            <SelectItem value="pfsense_standard">pfSense Firewall</SelectItem>
                            <SelectItem value="unifi_controller">UniFi Controller</SelectItem>
                            <SelectItem value="openwrt_generic">OpenWRT Generic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the type of network equipment you're using
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="routerHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Router IP Address</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.1" {...field} />
                          </FormControl>
                          <FormDescription>
                            IP address of your router/access point
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="routerPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="8728" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            API port (8728 for MikroTik, 443 for pfSense)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="routerUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="admin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="routerPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="radiusSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RADIUS Secret</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="testing123" {...field} />
                        </FormControl>
                        <FormDescription>
                          Shared secret for RADIUS authentication
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={updateConfigMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Shield size={16} />
                      {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                    </Button>

                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={testConnection}
                      disabled={testConnectionMutation.isPending || connectionStatus === 'testing'}
                      className="flex items-center gap-2"
                    >
                      <Wifi size={16} />
                      {connectionStatus === 'testing' ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor size={20} />
                Network Status
              </CardTitle>
              <CardDescription>
                Current network equipment connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Connection Status</h3>
                  <p className="text-sm text-gray-500">Status of network equipment connection</p>
                </div>
                <Badge 
                  variant={
                    connectionStatus === 'success' ? 'default' :
                    connectionStatus === 'failed' ? 'destructive' :
                    connectionStatus === 'testing' ? 'secondary' : 'outline'
                  }
                  className="flex items-center gap-1"
                >
                  {connectionStatus === 'success' && <CheckCircle size={14} />}
                  {connectionStatus === 'failed' && <XCircle size={14} />}
                  {connectionStatus === 'testing' && <AlertTriangle size={14} />}
                  {connectionStatus === 'success' ? 'Connected' :
                   connectionStatus === 'failed' ? 'Disconnected' :
                   connectionStatus === 'testing' ? 'Testing' : 'Unknown'}
                </Badge>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Current Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Equipment Type:</span>
                    <p className="font-medium">{currentConfig?.routerType || 'Not configured'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Router Host:</span>
                    <p className="font-medium">{currentConfig?.routerHost || 'Not configured'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">API Port:</span>
                    <p className="font-medium">{currentConfig?.routerPort || 'Not configured'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Client Network:</span>
                    <p className="font-medium">{currentConfig?.clientNetwork || 'Not configured'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Active Devices</h3>
                {activeDevices.length > 0 ? (
                  <div className="space-y-2">
                    {activeDevices.map((device: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{device.macAddress}</p>
                          <p className="text-sm text-gray-500">{device.ipAddress}</p>
                        </div>
                        <Badge variant="outline">{device.deviceType}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active devices connected via network equipment</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router size={20} />
                Setup Instructions
              </CardTitle>
              <CardDescription>
                Step-by-step guide to configure your network equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle size={16} />
                <AlertDescription>
                  <strong>Important:</strong> These instructions are for connecting real network equipment. 
                  The system currently works in demo mode without equipment connected.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">For {form.watch('equipmentType')} Equipment:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {getEquipmentInstructions(form.watch('equipmentType')).map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Network Architecture Overview:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                    <p><strong>1. Captive Portal:</strong> Redirects new users to voucher entry page</p>
                    <p><strong>2. Voucher Validation:</strong> System checks voucher against database</p>
                    <p><strong>3. Network Authorization:</strong> Equipment grants/denies access based on voucher</p>
                    <p><strong>4. Bandwidth Control:</strong> Limits applied based on voucher plan</p>
                    <p><strong>5. Session Monitoring:</strong> Real-time tracking of usage and limits</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Required Network Protocols:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>RADIUS:</strong> Authentication, Authorization, and Accounting</li>
                    <li><strong>DNS Redirection:</strong> Captures initial web requests</li>
                    <li><strong>HTTP/HTTPS Interception:</strong> Redirects to captive portal</li>
                    <li><strong>Bandwidth Shaping:</strong> Enforces speed and data limits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}