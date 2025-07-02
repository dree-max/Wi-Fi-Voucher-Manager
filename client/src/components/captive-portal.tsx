import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const redeemVoucherSchema = z.object({
  code: z.string().min(1, "Please enter a voucher code"),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

type RedeemVoucherForm = z.infer<typeof redeemVoucherSchema>;

interface CaptivePortalProps {
  businessName?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  termsRequired?: boolean;
}

export default function CaptivePortal({
  businessName = "Coffee & Co.",
  welcomeMessage = "Welcome to our free WiFi! Enter your voucher code to get connected.",
  primaryColor = "#3B82F6",
  termsRequired = true,
}: CaptivePortalProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const form = useForm<RedeemVoucherForm>({
    resolver: zodResolver(redeemVoucherSchema),
    defaultValues: {
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
      setIsConnecting(true);
      setTimeout(() => {
        toast({
          title: "Connected!",
          description: "You are now connected to the WiFi network.",
        });
        setIsConnecting(false);
      }, 2000);
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

  if (isConnecting) {
    return (
      <div className="max-w-sm mx-auto">
        <Card className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="h-32 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300')"
            }}
          />
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="text-primary animate-pulse" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connecting...</h3>
            <p className="text-sm text-gray-600 mb-6">Please wait while we connect you to the WiFi network.</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card className="border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="h-32 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300')"
          }}
        />
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{businessName}</h3>
          <p className="text-sm text-gray-600 mb-6">{welcomeMessage}</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter voucher code"
                        className="text-center font-mono text-lg"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
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
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <span className="text-xs text-gray-500">
                          I agree to the Terms & Conditions
                        </span>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
