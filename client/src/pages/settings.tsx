import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save, Wifi, Shield, Bell, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const networkSettingsSchema = z.object({
  ssid: z.string().min(1, "WiFi network name is required"),
  gatewayIp: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP address"),
  dnsServers: z.string().min(1, "DNS servers are required"),
  maxConcurrentUsers: z.number().min(1, "Must be at least 1").max(10000, "Maximum 10,000 users"),
});

const voucherDefaultsSchema = z.object({
  defaultDuration: z.number().min(1, "Duration must be at least 1 minute"),
  defaultDataLimit: z.number().optional(),
  defaultSpeedLimitDown: z.number().min(1, "Download speed must be at least 1 Mbps"),
  defaultSpeedLimitUp: z.number().min(1, "Upload speed must be at least 1 Mbps"),
  maxDevicesPerVoucher: z.number().min(1, "Must allow at least 1 device").max(10, "Maximum 10 devices"),
});

const securitySettingsSchema = z.object({
  contentFiltering: z.boolean(),
  requireTermsAcceptance: z.boolean(),
  sessionLogging: z.boolean(),
  sessionTimeout: z.number().min(1, "Timeout must be at least 1 minute").max(1440, "Maximum 24 hours"),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  adminEmail: z.string().email("Invalid email address").optional(),
  lowCreditAlerts: z.boolean(),
  alertThreshold: z.number().min(1, "Threshold must be at least 1"),
});

type NetworkSettingsForm = z.infer<typeof networkSettingsSchema>;
type VoucherDefaultsForm = z.infer<typeof voucherDefaultsSchema>;
type SecuritySettingsForm = z.infer<typeof securitySettingsSchema>;
type NotificationSettingsForm = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("network");

  useEffect(() => {
    const event = new CustomEvent('pageChange', {
      detail: {
        title: 'System Settings',
        subtitle: 'Configure your WiFi voucher system preferences'
      }
    });
    window.dispatchEvent(event);
  }, []);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Convert settings array to object for easier access
  const settingsObj = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const networkForm = useForm<NetworkSettingsForm>({
    resolver: zodResolver(networkSettingsSchema),
    defaultValues: {
      ssid: "Guest-WiFi",
      gatewayIp: "192.168.1.1",
      dnsServers: "8.8.8.8, 8.8.4.4",
      maxConcurrentUsers: 200,
    },
  });

  const voucherForm = useForm<VoucherDefaultsForm>({
    resolver: zodResolver(voucherDefaultsSchema),
    defaultValues: {
      defaultDuration: 120, // 2 hours in minutes
      defaultDataLimit: 1024, // 1GB in MB
      defaultSpeedLimitDown: 10,
      defaultSpeedLimitUp: 5,
      maxDevicesPerVoucher: 3,
    },
  });

  const securityForm = useForm<SecuritySettingsForm>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      contentFiltering: true,
      requireTermsAcceptance: true,
      sessionLogging: true,
      sessionTimeout: 30,
    },
  });

  const notificationForm = useForm<NotificationSettingsForm>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      adminEmail: "admin@example.com",
      lowCreditAlerts: true,
      alertThreshold: 50,
    },
  });

  // Update forms when settings load
  useEffect(() => {
    if (settings.length > 0) {
      networkForm.reset({
        ssid: settingsObj.ssid || "Guest-WiFi",
        gatewayIp: settingsObj.gatewayIp || "192.168.1.1",
        dnsServers: settingsObj.dnsServers || "8.8.8.8, 8.8.4.4",
        maxConcurrentUsers: parseInt(settingsObj.maxConcurrentUsers) || 200,
      });

      voucherForm.reset({
        defaultDuration: parseInt(settingsObj.defaultDuration) || 120,
        defaultDataLimit: parseInt(settingsObj.defaultDataLimit) || 1024,
        defaultSpeedLimitDown: parseInt(settingsObj.defaultSpeedLimitDown) || 10,
        defaultSpeedLimitUp: parseInt(settingsObj.defaultSpeedLimitUp) || 5,
        maxDevicesPerVoucher: parseInt(settingsObj.maxDevicesPerVoucher) || 3,
      });

      securityForm.reset({
        contentFiltering: settingsObj.contentFiltering === "true",
        requireTermsAcceptance: settingsObj.requireTermsAcceptance === "true",
        sessionLogging: settingsObj.sessionLogging === "true",
        sessionTimeout: parseInt(settingsObj.sessionTimeout) || 30,
      });

      notificationForm.reset({
        emailNotifications: settingsObj.emailNotifications === "true",
        adminEmail: settingsObj.adminEmail || "admin@example.com",
        lowCreditAlerts: settingsObj.lowCreditAlerts === "true",
        alertThreshold: parseInt(settingsObj.alertThreshold) || 50,
      });
    }
  }, [settings, settingsObj, networkForm, voucherForm, securityForm, notificationForm]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      await apiRequest("PUT", `/api/settings/${data.key}`, { value: data.value });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveAllSettings = async () => {
    try {
      const networkData = networkForm.getValues();
      const voucherData = voucherForm.getValues();
      const securityData = securityForm.getValues();
      const notificationData = notificationForm.getValues();

      // Save all settings
      const updates = [
        ...Object.entries(networkData).map(([key, value]) => ({ key, value: String(value) })),
        ...Object.entries(voucherData).map(([key, value]) => ({ key, value: String(value) })),
        ...Object.entries(securityData).map(([key, value]) => ({ key, value: String(value) })),
        ...Object.entries(notificationData).map(([key, value]) => ({ key, value: String(value) })),
      ];

      await Promise.all(updates.map(update => updateSettingsMutation.mutateAsync(update)));
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-96 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
          <p className="text-sm text-gray-500">Configure your WiFi voucher system preferences</p>
        </div>
        <Button 
          onClick={saveAllSettings}
          disabled={updateSettingsMutation.isPending}
          className="flex items-center space-x-2"
        >
          <Save size={16} />
          <span>{updateSettingsMutation.isPending ? "Saving..." : "Save All"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Network className="text-primary" size={20} />
            <CardTitle>Network Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...networkForm}>
              <div className="space-y-4">
                <FormField
                  control={networkForm.control}
                  name="ssid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WiFi Network Name (SSID)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={networkForm.control}
                  name="gatewayIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gateway IP Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={networkForm.control}
                  name="dnsServers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNS Servers</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={networkForm.control}
                  name="maxConcurrentUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Concurrent Users</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Voucher Defaults */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Wifi className="text-green-600" size={20} />
            <CardTitle>Default Voucher Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...voucherForm}>
              <div className="space-y-4">
                <FormField
                  control={voucherForm.control}
                  name="defaultDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Duration (minutes)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                          <SelectItem value="10080">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={voucherForm.control}
                  name="defaultDataLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Data Limit (MB)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "unlimited" ? undefined : parseInt(value))}
                        value={field.value?.toString() || "unlimited"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="500">500 MB</SelectItem>
                          <SelectItem value="1024">1 GB</SelectItem>
                          <SelectItem value="5120">5 GB</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={voucherForm.control}
                    name="defaultSpeedLimitDown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Download (Mbps)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={voucherForm.control}
                    name="defaultSpeedLimitUp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload (Mbps)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={voucherForm.control}
                  name="maxDevicesPerVoucher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Devices per Voucher</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Shield className="text-yellow-600" size={20} />
            <CardTitle>Security & Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...securityForm}>
              <div className="space-y-4">
                <FormField
                  control={securityForm.control}
                  name="contentFiltering"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Enable Content Filtering</FormLabel>
                        <p className="text-xs text-gray-500">Block access to inappropriate websites</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={securityForm.control}
                  name="requireTermsAcceptance"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Require Terms Acceptance</FormLabel>
                        <p className="text-xs text-gray-500">Users must agree to terms before connecting</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={securityForm.control}
                  name="sessionLogging"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Session Logging</FormLabel>
                        <p className="text-xs text-gray-500">Keep detailed logs of user sessions</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={securityForm.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Timeout (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Bell className="text-purple-600" size={20} />
            <CardTitle>Notifications & Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...notificationForm}>
              <div className="space-y-4">
                <FormField
                  control={notificationForm.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Email Notifications</FormLabel>
                        <p className="text-xs text-gray-500">Receive system alerts via email</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="lowCreditAlerts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Low Credit Alerts</FormLabel>
                        <p className="text-xs text-gray-500">Alert when vouchers are running low</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="alertThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Threshold (vouchers remaining)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
