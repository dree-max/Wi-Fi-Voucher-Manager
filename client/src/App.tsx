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
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vouchers" component={Vouchers} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/portal" component={Portal} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard Overview");
  const [currentPageSubtitle, setCurrentPageSubtitle] = useState("Monitor your WiFi voucher system performance");
  const { lastMessage } = useWebSocket('/ws');

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      console.log('Received WebSocket message:', lastMessage);
      // Here you could trigger refetches or show notifications
      // based on the message type
    }
  }, [lastMessage]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
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
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
