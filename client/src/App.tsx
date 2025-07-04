import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Vouchers from "@/pages/vouchers";
import Sessions from "@/pages/sessions";
import Portal from "@/pages/portal";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NetworkConfig from "@/pages/network-config";
import AdminLogin from "@/pages/admin-login";
import CustomerPortal from "@/pages/customer-portal";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/vouchers" component={Vouchers} />
      <Route path="/admin/sessions" component={Sessions} />
      <Route path="/admin/network" component={NetworkConfig} />
      <Route path="/admin/portal" component={Portal} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PublicRouter({ onAdminLogin }: { onAdminLogin: (credentials: any) => void }) {
  return (
    <Switch>
      <Route path="/" component={CustomerPortal} />
      <Route path="/admin/login">
        {() => <AdminLogin onLogin={onAdminLogin} />}
      </Route>
      <Route component={CustomerPortal} />
    </Switch>
  );
}

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("Dashboard Overview");
  const [currentPageSubtitle, setCurrentPageSubtitle] = useState("Monitor your WiFi voucher system performance");
  const { lastMessage } = useWebSocket('/ws');

  // Check for saved admin session
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuthenticated');
    if (savedAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Handle admin login
  const handleAdminLogin = (credentials: any) => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('adminAuthenticated', 'true');
    window.location.href = '/admin';
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    window.location.href = '/admin/login';
  };

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      console.log('Received WebSocket message:', lastMessage);
    }
  }, [lastMessage]);

  // Check current path to determine if we're in admin area
  const currentPath = window.location.pathname;
  const isAdminPath = currentPath.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isAdminPath ? (
          // Admin area
          <>
            {currentPath === '/admin/login' ? (
              <AdminLogin onLogin={handleAdminLogin} />
            ) : isAdminAuthenticated ? (
              <div className="flex h-screen bg-gray-50">
                <Sidebar onLogout={handleAdminLogout} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header 
                    title={currentPage} 
                    subtitle={currentPageSubtitle}
                    onPageChange={(title, subtitle) => {
                      setCurrentPage(title);
                      setCurrentPageSubtitle(subtitle);
                    }} 
                  />
                  <main className="flex-1 overflow-y-auto p-6">
                    <AdminRouter />
                  </main>
                </div>
              </div>
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )}
          </>
        ) : (
          // Public customer portal
          <PublicRouter onAdminLogin={handleAdminLogin} />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
