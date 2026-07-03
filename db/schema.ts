import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  json,
  bigint,
  boolean,
  date,
} from "drizzle-orm/mysql-core";

// ─── Users (OAuth) ──────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Organizations ──────────────────────────────────────────────────────────
export const organizations = mysqlTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "government",
    "ngo",
    "private",
    "community",
    "research",
  ]).notNull(),
  description: text("description"),
  address: text("address"),
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// ─── Nursery ────────────────────────────────────────────────────────────────
export const nurseries = mysqlTable("nurseries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  organizationId: bigint("organizationId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  capacity: int("capacity"),
  managerName: varchar("managerName", { length: 255 }),
  managerContact: varchar("managerContact", { length: 50 }),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Nursery = typeof nurseries.$inferSelect;
export type InsertNursery = typeof nurseries.$inferInsert;

// ─── Species ────────────────────────────────────────────────────────────────
export const species = mysqlTable("species", {
  id: serial("id").primaryKey(),
  commonName: varchar("commonName", { length: 255 }).notNull(),
  scientificName: varchar("scientificName", { length: 255 }).notNull(),
  family: varchar("family", { length: 255 }),
  category: mysqlEnum("category", [
    "timber",
    "fruit",
    "medicinal",
    "ornamental",
    "shade",
    "nitrogen_fixing",
    "mangrove",
    "bamboo",
    "other",
  ]).notNull(),
  growthRate: mysqlEnum("growthRate", ["slow", "moderate", "fast"]),
  maxHeight: int("maxHeight"),
  lifespan: int("lifespan"),
  waterRequirement: mysqlEnum("waterRequirement", [
    "low",
    "moderate",
    "high",
  ]),
  soilType: varchar("soilType", { length: 255 }),
  nativeRegion: varchar("nativeRegion", { length: 255 }),
  conservationStatus: mysqlEnum("conservationStatus", [
    "least_concern",
    "near_threatened",
    "vulnerable",
    "endangered",
    "critically_endangered",
  ]).default("least_concern"),
  uses: text("uses"),
  description: text("description"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Species = typeof species.$inferSelect;
export type InsertSpecies = typeof species.$inferInsert;

// ─── Nursery Stock ──────────────────────────────────────────────────────────
export const nurseryStock = mysqlTable("nursery_stock", {
  id: serial("id").primaryKey(),
  nurseryId: bigint("nurseryId", { mode: "number", unsigned: true }).notNull(),
  speciesId: bigint("speciesId", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  age: int("age"),
  batchNumber: varchar("batchNumber", { length: 100 }),
  source: varchar("source", { length: 255 }),
  plantedDate: date("plantedDate"),
  healthStatus: mysqlEnum("healthStatus", [
    "excellent",
    "good",
    "fair",
    "poor",
    "dead",
  ]).default("good"),
  notes: text("notes"),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NurseryStock = typeof nurseryStock.$inferSelect;
export type InsertNurseryStock = typeof nurseryStock.$inferInsert;

// ─── Plantations ────────────────────────────────────────────────────────────
export const plantations = mysqlTable("plantations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  organizationId: bigint("organizationId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  nurseryId: bigint("nurseryId", { mode: "number", unsigned: true }),
  speciesId: bigint("speciesId", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", [
    "afforestation",
    "reforestation",
    "agroforestry",
    "urban",
    "mangrove",
    "community",
    "commercial",
  ]).notNull(),
  status: mysqlEnum("status", [
    "planned",
    "in_progress",
    "completed",
    "maintaining",
    "completed_closed",
  ]).default("planned"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  areaHectares: decimal("areaHectares", { precision: 10, scale: 4 }),
  totalSaplings: int("totalSaplings"),
  plantedDate: date("plantedDate"),
  expectedCompletion: date("expectedCompletion"),
  description: text("description"),
  district: varchar("district", { length: 255 }),
  division: varchar("division", { length: 255 }),
  upazila: varchar("upazila", { length: 255 }),
  unionName: varchar("unionName", { length: 255 }),
  mouza: varchar("mouza", { length: 255 }),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Plantation = typeof plantations.$inferSelect;
export type InsertPlantation = typeof plantations.$inferInsert;

// ─── Monitoring Visits ──────────────────────────────────────────────────────
export const monitoringVisits = mysqlTable("monitoring_visits", {
  id: serial("id").primaryKey(),
  plantationId: bigint("plantationId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  visitedBy: varchar("visitedBy", { length: 255 }).notNull(),
  visitDate: date("visitDate").notNull(),
  survivalRate: int("survivalRate"),
  averageHeight: decimal("averageHeight", { precision: 6, scale: 2 }),
  growthStage: mysqlEnum("growthStage", [
    "seedling",
    "sapling",
    "juvenile",
    "mature",
  ]),
  healthStatus: mysqlEnum("healthStatus", [
    "excellent",
    "good",
    "fair",
    "poor",
    "critical",
  ]),
  pestDiseaseObserved: boolean("pestDiseaseObserved").default(false),
  pestDiseaseDetails: text("pestDiseaseDetails"),
  maintenanceNeeded: text("maintenanceNeeded"),
  maintenanceDone: text("maintenanceDone"),
  photos: json("photos"),
  gpsLatitude: decimal("gpsLatitude", { precision: 10, scale: 8 }),
  gpsLongitude: decimal("gpsLongitude", { precision: 11, scale: 8 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MonitoringVisit = typeof monitoringVisits.$inferSelect;
export type InsertMonitoringVisit = typeof monitoringVisits.$inferInsert;

// ─── AI Verifications ───────────────────────────────────────────────────────
export const aiVerifications = mysqlTable("ai_verifications", {
  id: serial("id").primaryKey(),
  plantationId: bigint("plantationId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  type: mysqlEnum("type", [
    "count_validation",
    "survival_check",
    "species_id",
    "growth_measure",
    "fraud_detect",
    "geolocation_verify",
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "flagged"])
    .default("pending")
    .notNull(),
  aiConfidence: decimal("aiConfidence", { precision: 5, scale: 4 }),
  detectedCount: int("detectedCount"),
  humanVerified: boolean("humanVerified").default(false),
  verifiedBy: varchar("verifiedBy", { length: 255 }),
  imageUrl: text("imageUrl"),
  result: json("result"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIVerification = typeof aiVerifications.$inferSelect;
export type InsertAIVerification = typeof aiVerifications.$inferInsert;

// ─── Satellite NDVI Records ─────────────────────────────────────────────────
export const satelliteRecords = mysqlTable("satellite_records", {
  id: serial("id").primaryKey(),
  plantationId: bigint("plantationId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  captureDate: date("captureDate").notNull(),
  ndviAverage: decimal("ndviAverage", { precision: 5, scale: 4 }),
  ndviMin: decimal("ndviMin", { precision: 5, scale: 4 }),
  ndviMax: decimal("ndviMax", { precision: 5, scale: 4 }),
  eviAverage: decimal("eviAverage", { precision: 5, scale: 4 }),
  saviAverage: decimal("saviAverage", { precision: 5, scale: 4 }),
  ndwiAverage: decimal("ndwiAverage", { precision: 5, scale: 4 }),
  gndviAverage: decimal("gndviAverage", { precision: 5, scale: 4 }),
  cloudCover: int("cloudCover"),
  dataSource: varchar("dataSource", { length: 100 }).default("sentinel2"),
  tileUrl: text("tileUrl"),
  metadata: json("metadata"),
  anomalyFlags: text("anomalyFlags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SatelliteRecord = typeof satelliteRecords.$inferSelect;
export type InsertSatelliteRecord = typeof satelliteRecords.$inferInsert;

// ─── Notifications ──────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", [
    "planting_reminder",
    "monitoring_due",
    "alert_survival_low",
    "alert_ndvi_anomaly",
    "ai_verification_result",
    "token_reward",
    "report_ready",
    "system",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  referenceId: bigint("referenceId", { mode: "number", unsigned: true }),
  referenceType: varchar("referenceType", { length: 50 }),
  isRead: boolean("isRead").default(false).notNull(),
  actionUrl: varchar("actionUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Tokens ─────────────────────────────────────────────────────────────────
export const tokens = mysqlTable("tokens", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  plantationId: bigint("plantationId", {
    mode: "number",
    unsigned: true,
  }),
  type: mysqlEnum("type", [
    "planting",
    "monitoring",
    "survival_high",
    "survival_milestone",
    "verification",
    "community_report",
    "badge_unlock",
    "penalty_fake_gps",
    "penalty_duplicate",
    "penalty_spam",
  ]).notNull(),
  amount: int("amount").notNull(),
  balance: int("balance").notNull(),
  description: text("description"),
  referenceId: bigint("referenceId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;

// ─── Badges ─────────────────────────────────────────────────────────────────
export const badges = mysqlTable("badges", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  badgeType: mysqlEnum("badgeType", [
    "first_planting",
    "hundred_trees",
    "thousand_trees",
    "ten_thousand_trees",
    "monitoring_expert",
    "survival_champion",
    "community_hero",
    "ai_verifier",
    "early_bird",
    "consistent_planter",
    "master_planter",
    "carbon_warrior",
  ]).notNull(),
  level: int("level").default(1),
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
  metadata: json("metadata"),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

// ─── Reports ────────────────────────────────────────────────────────────────
export const reports = mysqlTable("reports", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "plantation_summary",
    "monitoring_report",
    "ndvi_analysis",
    "survival_analysis",
    "organization_report",
    "token_report",
    "custom",
  ]).notNull(),
  organizationId: bigint("organizationId", {
    mode: "number",
    unsigned: true,
  }),
  plantationId: bigint("plantationId", {
    mode: "number",
    unsigned: true,
  }),
  filters: json("filters"),
  generatedBy: bigint("generatedBy", { mode: "number", unsigned: true }),
  fileUrl: text("fileUrl"),
  status: mysqlEnum("status", ["generating", "ready", "failed"]).default(
    "generating"
  ),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ─── Leaderboard ────────────────────────────────────────────────────────────
export const leaderboard = mysqlTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  rank: int("rank").notNull(),
  score: int("score").default(0).notNull(),
  treesPlanted: int("treesPlanted").default(0),
  treesSurvived: int("treesSurvived").default(0),
  monitoringCount: int("monitoringCount").default(0),
  tokenBalance: int("tokenBalance").default(0),
  badgeCount: int("badgeCount").default(0),
  period: mysqlEnum("period", ["weekly", "monthly", "yearly", "all_time"])
    .default("all_time")
    .notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboard.$inferInsert;

// ─── Activity Log ───────────────────────────────────────────────────────────
export const activityLog = mysqlTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  action: mysqlEnum("action", [
    "create",
    "update",
    "delete",
    "verify",
    "monitor",
    "plant",
    "report",
    "login",
    "other",
  ]).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: bigint("entityId", { mode: "number", unsigned: true }),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
