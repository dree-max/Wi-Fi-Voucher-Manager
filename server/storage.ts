import {
  users,
  vouchers,
  voucherPlans,
  userSessions,
  systemSettings,
  portalSettings,
  analyticsData,
  type User,
  type UpsertUser,
  type Voucher,
  type InsertVoucher,
  type VoucherPlan,
  type InsertVoucherPlan,
  type UserSession,
  type InsertUserSession,
  type SystemSetting,
  type InsertSystemSetting,
  type PortalSetting,
  type InsertPortalSetting,
  type AnalyticsData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Voucher plans
  getVoucherPlans(): Promise<VoucherPlan[]>;
  createVoucherPlan(plan: InsertVoucherPlan): Promise<VoucherPlan>;
  updateVoucherPlan(id: number, plan: Partial<InsertVoucherPlan>): Promise<VoucherPlan | undefined>;
  deleteVoucherPlan(id: number): Promise<boolean>;

  // Vouchers
  getVouchers(limit?: number, offset?: number): Promise<Voucher[]>;
  getVoucherByCode(code: string): Promise<Voucher | undefined>;
  createVouchers(vouchers: InsertVoucher[]): Promise<Voucher[]>;
  updateVoucherStatus(id: number, status: string, usedBy?: string): Promise<Voucher | undefined>;
  getVoucherStats(): Promise<{
    total: number;
    active: number;
    used: number;
    expired: number;
  }>;

  // User sessions
  getActiveSessions(): Promise<UserSession[]>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  endUserSession(id: number): Promise<boolean>;
  updateSessionActivity(id: number, dataUsed: number): Promise<boolean>;
  getSessionStats(): Promise<{
    connected: number;
    peakToday: number;
    avgDuration: number;
    totalDataToday: number;
  }>;

  // System settings
  getSystemSettings(): Promise<SystemSetting[]>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;

  // Portal settings
  getPortalSettings(): Promise<PortalSetting | undefined>;
  updatePortalSettings(settings: Partial<InsertPortalSetting>): Promise<PortalSetting>;

  // Analytics
  getAnalyticsData(startDate: Date, endDate: Date): Promise<AnalyticsData[]>;
  createAnalyticsEntry(data: Partial<AnalyticsData>): Promise<AnalyticsData>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Voucher plans
  async getVoucherPlans(): Promise<VoucherPlan[]> {
    return await db.select().from(voucherPlans).where(eq(voucherPlans.isActive, true));
  }

  async createVoucherPlan(plan: InsertVoucherPlan): Promise<VoucherPlan> {
    const [newPlan] = await db.insert(voucherPlans).values(plan).returning();
    return newPlan;
  }

  async updateVoucherPlan(id: number, plan: Partial<InsertVoucherPlan>): Promise<VoucherPlan | undefined> {
    const [updated] = await db
      .update(voucherPlans)
      .set(plan)
      .where(eq(voucherPlans.id, id))
      .returning();
    return updated;
  }

  async deleteVoucherPlan(id: number): Promise<boolean> {
    const result = await db
      .update(voucherPlans)
      .set({ isActive: false })
      .where(eq(voucherPlans.id, id));
    return result.rowCount > 0;
  }

  // Vouchers
  async getVouchers(limit = 50, offset = 0): Promise<Voucher[]> {
    return await db
      .select()
      .from(vouchers)
      .orderBy(desc(vouchers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getVoucherByCode(code: string): Promise<Voucher | undefined> {
    const [voucher] = await db.select().from(vouchers).where(eq(vouchers.code, code));
    return voucher;
  }

  async createVouchers(voucherData: InsertVoucher[]): Promise<Voucher[]> {
    return await db.insert(vouchers).values(voucherData).returning();
  }

  async updateVoucherStatus(id: number, status: string, usedBy?: string): Promise<Voucher | undefined> {
    const updateData: any = { status };
    if (status === "used") {
      updateData.usedAt = new Date();
      if (usedBy) updateData.usedBy = usedBy;
    }
    
    const [updated] = await db
      .update(vouchers)
      .set(updateData)
      .where(eq(vouchers.id, id))
      .returning();
    return updated;
  }

  async getVoucherStats(): Promise<{
    total: number;
    active: number;
    used: number;
    expired: number;
  }> {
    const stats = await db
      .select({
        status: vouchers.status,
        count: count(),
      })
      .from(vouchers)
      .groupBy(vouchers.status);

    const result = {
      total: 0,
      active: 0,
      used: 0,
      expired: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      if (stat.status === "active") result.active = stat.count;
      else if (stat.status === "used") result.used = stat.count;
      else if (stat.status === "expired") result.expired = stat.count;
    });

    return result;
  }

  // User sessions
  async getActiveSessions(): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.isActive, true))
      .orderBy(desc(userSessions.lastActivity));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values(session).returning();
    return newSession;
  }

  async endUserSession(id: number): Promise<boolean> {
    const result = await db
      .update(userSessions)
      .set({ 
        isActive: false, 
        endTime: new Date() 
      })
      .where(eq(userSessions.id, id));
    return result.rowCount > 0;
  }

  async updateSessionActivity(id: number, dataUsed: number): Promise<boolean> {
    const result = await db
      .update(userSessions)
      .set({ 
        dataUsed,
        lastActivity: new Date() 
      })
      .where(eq(userSessions.id, id));
    return result.rowCount > 0;
  }

  async getSessionStats(): Promise<{
    connected: number;
    peakToday: number;
    avgDuration: number;
    totalDataToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [connectedResult] = await db
      .select({ count: count() })
      .from(userSessions)
      .where(eq(userSessions.isActive, true));

    const [todayDataResult] = await db
      .select({ 
        totalData: sql<number>`COALESCE(SUM(${userSessions.dataUsed}), 0)`,
        avgDuration: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE(${userSessions.endTime}, NOW()) - ${userSessions.startTime}))/60), 0)`
      })
      .from(userSessions)
      .where(gte(userSessions.startTime, today));

    return {
      connected: connectedResult.count,
      peakToday: 156, // This would need more complex query for actual peak
      avgDuration: Math.round(todayDataResult.avgDuration || 0),
      totalDataToday: todayDataResult.totalData || 0,
    };
  }

  // System settings
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  // Portal settings
  async getPortalSettings(): Promise<PortalSetting | undefined> {
    const [settings] = await db.select().from(portalSettings).limit(1);
    return settings;
  }

  async updatePortalSettings(settings: Partial<InsertPortalSetting>): Promise<PortalSetting> {
    // Check if settings exist
    const existing = await this.getPortalSettings();
    
    if (existing) {
      const [updated] = await db
        .update(portalSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(portalSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(portalSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  // Analytics
  async getAnalyticsData(startDate: Date, endDate: Date): Promise<AnalyticsData[]> {
    return await db
      .select()
      .from(analyticsData)
      .where(
        and(
          gte(analyticsData.date, startDate),
          lte(analyticsData.date, endDate)
        )
      )
      .orderBy(analyticsData.date);
  }

  async createAnalyticsEntry(data: Partial<AnalyticsData>): Promise<AnalyticsData> {
    const [entry] = await db
      .insert(analyticsData)
      .values({ date: new Date(), ...data })
      .returning();
    return entry;
  }
}

export const storage = new DatabaseStorage();
