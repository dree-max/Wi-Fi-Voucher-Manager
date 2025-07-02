import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save, Smartphone } from "lucide-react";
import CaptivePortal from "@/components/captive-portal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const portalSettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  welcomeMessage: z.string().min(1, "Welcome message is required"),
  primaryColor: z.string().min(7, "Please select a color"),
  termsRequired: z.boolean(),
  termsContent: z.string().optional(),
});

type PortalSettingsForm = z.infer<typeof portalSettingsSchema>;

export default function Portal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const event = new CustomEvent('pageChange', {
      detail: {
        title: 'Captive Portal',
        subtitle: 'Customize your branded WiFi login experience'
      }
    });
    window.dispatchEvent(event);
  }, []);

  const { data: portalSettings, isLoading } = useQuery({
    queryKey: ["/api/portal/settings"],
  });

  const form = useForm<PortalSettingsForm>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
      businessName: "Coffee & Co.",
      welcomeMessage: "Welcome to our free WiFi! Enter your voucher code to get connected.",
      primaryColor: "#3B82F6",
      termsRequired: true,
      termsContent: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (portalSettings) {
      form.reset({
        businessName: portalSettings.businessName || "Coffee & Co.",
        welcomeMessage: portalSettings.welcomeMessage || "Welcome to our free WiFi! Enter your voucher code to get connected.",
        primaryColor: portalSettings.primaryColor || "#3B82F6",
        termsRequired: portalSettings.termsRequired ?? true,
        termsContent: portalSettings.termsContent || "",
      });
    }
  }, [portalSettings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: PortalSettingsForm) => {
      await apiRequest("PUT", "/api/portal/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Portal settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PortalSettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  // Watch form values for live preview
  const watchedValues = form.watch();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
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
          <h3 className="text-lg font-semibold text-gray-900">Captive Portal</h3>
          <p className="text-sm text-gray-500">Customize your branded WiFi login experience</p>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateSettingsMutation.isPending}
          className="flex items-center space-x-2"
        >
          <Save size={16} />
          <span>{updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portal Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Portal Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="welcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex items-center space-x-3">
                        <FormControl>
                          <input
                            type="color"
                            {...field}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                        </FormControl>
                        <FormControl>
                          <Input {...field} className="flex-1" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-400 text-2xl mb-2">☁️</div>
                  <p className="text-sm text-gray-500 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="termsRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Terms & Conditions Required</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {watchedValues.termsRequired && (
                  <FormField
                    control={form.control}
                    name="termsContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={4} 
                            placeholder="Enter your terms and conditions..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Portal Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Live Preview</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Smartphone size={16} />
              <span>Mobile View</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <CaptivePortal
                businessName={watchedValues.businessName}
                welcomeMessage={watchedValues.welcomeMessage}
                primaryColor={watchedValues.primaryColor}
                termsRequired={watchedValues.termsRequired}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
