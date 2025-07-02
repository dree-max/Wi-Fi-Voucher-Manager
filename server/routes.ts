import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertVoucherSchema, 
  insertVoucherPlanSchema,
  insertUserSessionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const voucherStats = await storage.getVoucherStats();
      const sessionStats = await storage.getSessionStats();
      
      res.json({
        activeVouchers: voucherStats.active,
        connectedUsers: sessionStats.connected,
        dataUsageToday: `${(sessionStats.totalDataToday / 1024).toFixed(1)} GB`,
        revenueToday: "$247", // This would come from actual calculations
        peakToday: sessionStats.peakToday,
        avgDuration: `${(sessionStats.avgDuration / 60).toFixed(1)}h`,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Voucher Plans
  app.get("/api/voucher-plans", async (req, res) => {
    try {
      const plans = await storage.getVoucherPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching voucher plans:", error);
      res.status(500).json({ message: "Failed to fetch voucher plans" });
    }
  });

  app.post("/api/voucher-plans", async (req, res) => {
    try {
      const planData = insertVoucherPlanSchema.parse(req.body);
      const plan = await storage.createVoucherPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error creating voucher plan:", error);
      res.status(500).json({ message: "Failed to create voucher plan" });
    }
  });

  // Vouchers
  app.get("/api/vouchers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const vouchers = await storage.getVouchers(limit, offset);
      res.json(vouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });

  app.post("/api/vouchers/generate", async (req, res) => {
    try {
      const { planId, quantity, customSettings } = req.body;
      const vouchersToCreate = [];

      for (let i = 0; i < quantity; i++) {
        const code = generateVoucherCode();
        vouchersToCreate.push({
          code,
          planId,
          status: "active" as const,
          ...customSettings,
        });
      }

      const vouchers = await storage.createVouchers(vouchersToCreate);
      broadcast({ type: 'vouchers_created', count: quantity });
      res.json(vouchers);
    } catch (error) {
      console.error("Error generating vouchers:", error);
      res.status(500).json({ message: "Failed to generate vouchers" });
    }
  });

  // Voucher redemption (captive portal simulation)
  app.post("/api/vouchers/redeem", async (req, res) => {
    try {
      const { code, deviceInfo } = req.body;
      
      // Validate input
      if (!code || !code.trim()) {
        return res.status(400).json({ message: "Voucher code is required" });
      }

      // Clean up the voucher code (remove spaces, convert to uppercase)
      const cleanCode = code.trim().toUpperCase();
      console.log(`Attempting to redeem voucher: ${cleanCode}`);

      // Find voucher in database
      const voucher = await storage.getVoucherByCode(cleanCode);

      if (!voucher) {
        console.log(`Voucher not found: ${cleanCode}`);
        return res.status(404).json({ 
          message: "Invalid voucher code. Please check your code and try again." 
        });
      }

      console.log(`Found voucher: ${voucher.code}, status: ${voucher.status}`);

      // Check if voucher is already used
      if (voucher.status === "used") {
        return res.status(400).json({ 
          message: "This voucher has already been used." 
        });
      }

      // Check if voucher is expired
      if (voucher.status === "expired") {
        return res.status(400).json({ 
          message: "This voucher has expired." 
        });
      }

      // Check if voucher is disabled
      if (voucher.status === "disabled") {
        return res.status(400).json({ 
          message: "This voucher has been disabled." 
        });
      }

      // Check validity period
      if (voucher.validUntil && new Date() > new Date(voucher.validUntil)) {
        // Update status to expired
        await storage.updateVoucherStatus(voucher.id, "expired");
        return res.status(400).json({ 
          message: "This voucher has expired." 
        });
      }

      // Voucher is valid - update status to used
      await storage.updateVoucherStatus(voucher.id, "used", deviceInfo?.macAddress);

      // Create user session
      const session = await storage.createUserSession({
        voucherId: voucher.id,
        ipAddress: deviceInfo?.ipAddress || "192.168.1.100",
        macAddress: deviceInfo?.macAddress || "00:11:22:33:44:55",
        deviceType: deviceInfo?.deviceType || "laptop",
        userAgent: deviceInfo?.userAgent || "Unknown",
      });

      console.log(`Voucher redeemed successfully: ${cleanCode}`);
      
      // Broadcast real-time update
      broadcast({ 
        type: 'session_started', 
        session: {
          ...session,
          voucher: voucher
        }
      });

      res.json({ 
        success: true, 
        session: session,
        voucher: voucher,
        message: "Voucher redeemed successfully! You are now connected to WiFi."
      });
    } catch (error) {
      console.error("Error redeeming voucher:", error);
      res.status(500).json({ message: "Failed to redeem voucher. Please try again." });
    }
  });

  // Active Sessions
  app.get("/api/sessions/active", async (req, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      res.status(500).json({ message: "Failed to fetch active sessions" });
    }
  });

  app.post("/api/sessions/:id/disconnect", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const success = await storage.endUserSession(sessionId);
      
      if (success) {
        broadcast({ type: 'session_ended', sessionId });
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Session not found" });
      }
    } catch (error) {
      console.error("Error disconnecting session:", error);
      res.status(500).json({ message: "Failed to disconnect session" });
    }
  });

  // Portal Settings
  app.get("/api/portal/settings", async (req, res) => {
    try {
      const settings = await storage.getPortalSettings();
      res.json(settings || {
        businessName: "WiFi Hotspot",
        welcomeMessage: "Welcome to our free WiFi! Enter your voucher code to get connected.",
        primaryColor: "#3B82F6",
        termsRequired: true,
      });
    } catch (error) {
      console.error("Error fetching portal settings:", error);
      res.status(500).json({ message: "Failed to fetch portal settings" });
    }
  });

  app.put("/api/portal/settings", async (req, res) => {
    try {
      const settings = await storage.updatePortalSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating portal settings:", error);
      res.status(500).json({ message: "Failed to update portal settings" });
    }
  });

  // System Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.updateSystemSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const startDate = new Date(req.query.startDate as string || Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(req.query.endDate as string || Date.now());
      
      const analyticsData = await storage.getAnalyticsData(startDate, endDate);
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  return httpServer;
}

// Helper function to generate unique voucher codes
function generateVoucherCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "WIFI-2024-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
