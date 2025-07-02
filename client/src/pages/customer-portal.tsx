import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Wifi, CheckCircle, Clock, Signal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const redeemVoucherSchema = z.object({
  code: z.string().min(1, "Please enter a voucher code"),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

type RedeemVoucherForm = z.infer<typeof redeemVoucherSchema>;

export default function CustomerPortal() {
  const { toast } = useToast();
  const [connectionStep, setConnectionStep] = useState<'input' | 'connecting' | 'connected'>('input');
  const [connectionProgress, setConnectionProgress] = useState(0);

  // Fetch portal settings for branding
  const { data: portalSettings } = useQuery({
    queryKey: ["/api/portal/settings"],
  });

  const form = useForm<RedeemVoucherForm>({
    resolver: zodResolver(redeemVoucherSchema),
    defaultValues: {
      code: "",
      acceptTerms: false,
    },
  });

  const redeemVoucherMutation = useMutation({
    mutationFn: async (data: { code: string }) => {
      const deviceInfo = {
        ipAddress: "192.168.1.100", // This would be detected by the actual system
        macAddress: "00:11:22:33:44:55",
        deviceType: "laptop",
        userAgent: navigator.userAgent,
      };
      
      const response = await apiRequest("POST", "/api/vouchers/redeem", {
        code: data.code,
        deviceInfo,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setConnectionStep('connecting');
      
      // Simulate connection progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        setConnectionProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setConnectionStep('connected');
            toast({
              title: "Connected Successfully!",
              description: "You are now connected to the WiFi network.",
            });
          }, 500);
        }
      }, 300);
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RedeemVoucherForm) => {
    redeemVoucherMutation.mutate({ code: data.code });
  };

  const businessName = (portalSettings as any)?.businessName || "Guest WiFi";
  const welcomeMessage = (portalSettings as any)?.welcomeMessage || "Welcome! Enter your voucher code to connect to our WiFi network.";
  const primaryColor = (portalSettings as any)?.primaryColor || "#3B82F6";
  const termsRequired = (portalSettings as any)?.termsRequired ?? true;

  // Connection successful screen
  if (connectionStep === 'connected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div 
              className="h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300')"
              }}
            >
              <div className="absolute inset-0 bg-green-600 bg-opacity-20"></div>
            </div>
            
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Connected!</h2>
              <p className="text-gray-600 mb-6">
                You are now connected to <strong>{businessName}</strong> WiFi network.
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm text-green-800">
                  <span>Network Status</span>
                  <div className="flex items-center space-x-1">
                    <Signal className="text-green-600" size={16} />
                    <span className="font-medium">Connected</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Your session will remain active as per your voucher terms</p>
                <p>• Please keep this window open to maintain connection</p>
                <p>• Contact staff if you experience any issues</p>
              </div>
              
              <Button 
                className="w-full mt-6"
                style={{ backgroundColor: primaryColor }}
                onClick={() => window.open('https://www.google.com', '_blank')}
              >
                Start Browsing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Connecting screen
  if (connectionStep === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div 
              className="h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300')"
              }}
            >
              <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>
            </div>
            
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wifi className="text-blue-600 animate-pulse" size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Connecting...</h2>
              <p className="text-gray-600 mb-6">
                Please wait while we connect you to the WiFi network.
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${connectionProgress}%`,
                    backgroundColor: primaryColor 
                  }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">
                {connectionProgress < 30 && "Validating voucher..."}
                {connectionProgress >= 30 && connectionProgress < 60 && "Authenticating device..."}
                {connectionProgress >= 60 && connectionProgress < 90 && "Configuring network access..."}
                {connectionProgress >= 90 && "Finalizing connection..."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Initial voucher input screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl overflow-hidden">
          <div 
            className="h-32 bg-cover bg-center relative"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300')"
            }}
          >
            <div 
              className="absolute inset-0 bg-opacity-30"
              style={{ backgroundColor: primaryColor }}
            ></div>
          </div>
          
          <CardContent className="p-8 text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Wifi style={{ color: primaryColor }} size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{businessName}</h2>
            <p className="text-gray-600 mb-8">{welcomeMessage}</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter voucher code (e.g., WIFI-2024-ABC123)"
                          className="text-center font-mono text-lg h-14 text-gray-900 placeholder-gray-400"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium"
                  disabled={redeemVoucherMutation.isPending}
                  style={{ backgroundColor: primaryColor }}
                >
                  {redeemVoucherMutation.isPending ? "Connecting..." : "Connect to WiFi"}
                </Button>
                
                {termsRequired && (
                  <div className="pt-4 border-t border-gray-200">
                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="text-left">
                            <span className="text-sm text-gray-600">
                              I agree to the{" "}
                              <button 
                                type="button" 
                                className="text-blue-600 hover:underline"
                                onClick={() => alert("Terms and Conditions content would be displayed here")}
                              >
                                Terms & Conditions
                              </button>
                              {" "}and acceptable use policy
                            </span>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </form>
            </Form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-500 mb-2">Test voucher codes:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">WIFI-2024-TEST01</code>
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">WIFI-2024-TEST02</code>
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">WIFI-2024-TEST03</code>
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">WIFI-2024-GUEST</code>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>Time-based access</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Signal size={14} />
                  <span>High-speed internet</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our staff for assistance
          </p>
        </div>
      </div>
    </div>
  );
}