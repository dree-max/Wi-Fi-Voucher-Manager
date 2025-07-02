import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  decimal,
  varchar,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (admin users)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Voucher types/plans
export const voucherPlans = pgTable("voucher_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // Basic, Standard, Premium, Custom
  duration: integer("duration").notNull(), // in minutes
  dataLimit: integer("data_limit"), // in MB, null for unlimited
  speedLimitDown: integer("speed_limit_down"), // in Mbps
  speedLimitUp: integer("speed_limit_up"), // in Mbps
  maxDevices: integer("max_devices").default(1),
  price: decimal("price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vouchers
export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  planId: integer("plan_id").references(() => voucherPlans.id),
  status: varchar("status").default("active"), // active, used, expired, disabled
  createdBy: varchar("created_by").references(() => users.id),
  validUntil: timestamp("valid_until"),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by"), // MAC address or device identifier
  createdAt: timestamp("created_at").defaultNow(),
});

// Active user sessions
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  voucherId: integer("voucher_id").references(() => vouchers.id),
  ipAddress: varchar("ip_address").notNull(),
  macAddress: varchar("mac_address"),
  deviceType: varchar("device_type"), // mobile, laptop, tablet, desktop
  userAgent: text("user_agent"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  dataUsed: integer("data_used").default(0), // in MB
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portal customization
export const portalSettings = pgTable("portal_settings", {
  id: serial("id").primaryKey(),
  businessName: varchar("business_name"),
  welcomeMessage: text("welcome_message"),
  primaryColor: varchar("primary_color").default("#3B82F6"),
  logoUrl: varchar("logo_url"),
  termsRequired: boolean("terms_required").default(true),
  termsContent: text("terms_content"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics data
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalSessions: integer("total_sessions").default(0),
  totalDataUsed: integer("total_data_used").default(0), // in MB
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  avgSessionDuration: integer("avg_session_duration").default(0), // in minutes
  peakUsers: integer("peak_users").default(0),
  uniqueDevices: integer("unique_devices").default(0),
});

// Relations
export const voucherPlansRelations = relations(voucherPlans, ({ many }) => ({
  vouchers: many(vouchers),
}));

export const vouchersRelations = relations(vouchers, ({ one, many }) => ({
  plan: one(voucherPlans, {
    fields: [vouchers.planId],
    references: [voucherPlans.id],
  }),
  createdByUser: one(users, {
    fields: [vouchers.createdBy],
    references: [users.id],
  }),
  sessions: many(userSessions),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  voucher: one(vouchers, {
    fields: [userSessions.voucherId],
    references: [vouchers.id],
  }),
}));

// Insert schemas
export const insertVoucherPlanSchema = createInsertSchema(voucherPlans).omit({
  id: true,
  createdAt: true,
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  startTime: true,
  lastActivity: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertPortalSettingSchema = createInsertSchema(portalSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type VoucherPlan = typeof voucherPlans.$inferSelect;
export type InsertVoucherPlan = z.infer<typeof insertVoucherPlanSchema>;
export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type PortalSetting = typeof portalSettings.$inferSelect;
export type InsertPortalSetting = z.infer<typeof insertPortalSettingSchema>;
export type AnalyticsData = typeof analyticsData.$inferSelect;
