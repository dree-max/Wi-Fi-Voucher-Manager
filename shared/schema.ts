import { 
  mysqlTable, 
  text, 
  serial, 
  int, 
  bigint,
  boolean, 
  timestamp, 
  decimal,
  varchar,
  json,
  index
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for auth)
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (admin users)
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { length: 50 }).default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Voucher types/plans
export const voucherPlans = mysqlTable("voucher_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Basic, Standard, Premium, Custom
  duration: int("duration").notNull(), // in minutes
  dataLimit: int("data_limit"), // in MB, null for unlimited
  speedLimitDown: int("speed_limit_down"), // in Mbps
  speedLimitUp: int("speed_limit_up"), // in Mbps
  maxDevices: int("max_devices").default(1),
  price: decimal("price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vouchers
export const vouchers = mysqlTable("vouchers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  planId: bigint("plan_id", { mode: "number", unsigned: true }).references(() => voucherPlans.id),
  status: varchar("status", { length: 50 }).default("active"), // active, used, expired, disabled
  createdBy: varchar("created_by", { length: 255 }).references(() => users.id),
  validUntil: timestamp("valid_until"),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by", { length: 255 }), // MAC address or device identifier
  createdAt: timestamp("created_at").defaultNow(),
});

// Active user sessions
export const userSessions = mysqlTable("user_sessions", {
  id: serial("id").primaryKey(),
  voucherId: bigint("voucher_id", { mode: "number", unsigned: true }).references(() => vouchers.id),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  macAddress: varchar("mac_address", { length: 17 }),
  deviceType: varchar("device_type", { length: 50 }), // mobile, laptop, tablet, desktop
  userAgent: text("user_agent"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  dataUsed: int("data_used").default(0), // in MB
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
});

// System settings
export const systemSettings = mysqlTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portal customization
export const portalSettings = mysqlTable("portal_settings", {
  id: serial("id").primaryKey(),
  businessName: varchar("business_name", { length: 255 }),
  welcomeMessage: text("welcome_message"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#3B82F6"),
  logoUrl: varchar("logo_url", { length: 500 }),
  termsRequired: boolean("terms_required").default(true),
  termsContent: text("terms_content"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics data
export const analyticsData = mysqlTable("analytics_data", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalSessions: int("total_sessions").default(0),
  totalDataUsed: int("total_data_used").default(0), // in MB
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  avgSessionDuration: int("avg_session_duration").default(0), // in minutes
  peakUsers: int("peak_users").default(0),
  uniqueDevices: int("unique_devices").default(0),
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
