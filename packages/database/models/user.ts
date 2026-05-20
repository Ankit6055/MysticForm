import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),

  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"),
  authProvider: varchar("auth_provider", { length: 20 })
    .array()
    .notNull()
    .default(sql`ARRAY[]::varchar[]`),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
