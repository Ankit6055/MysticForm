import { boolean, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export type ThemeTokens = {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  font: string;
  radius: string;
};

export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 60 }).notNull(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  description: text("description"),
  tokens: jsonb("tokens").$type<ThemeTokens>().notNull(),
  previewImageUrl: text("preview_image_url"),
  isBuiltIn: boolean("is_built_in").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
