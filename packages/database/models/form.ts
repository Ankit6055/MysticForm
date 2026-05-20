import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { themesTable } from "./theme";

export const formVisibilityEnum = pgEnum("form_visibility", ["draft", "unlisted", "public"]);
export const formStatusEnum = pgEnum("form_status", ["active", "archived"]);

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    themeId: uuid("theme_id").references(() => themesTable.id, { onDelete: "set null" }),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    visibility: formVisibilityEnum("visibility").notNull().default("draft"),
    status: formStatusEnum("status").notNull().default("active"),
    coverEmoji: varchar("cover_emoji", { length: 8 }),
    submitLabel: varchar("submit_label", { length: 40 }).default("Submit"),
    thankYouMessage: text("thank_you_message"),
    notifyRespondent: boolean("notify_respondent").default(false),
    isTemplate: boolean("is_template").default(false),
    passwordHash: text("password_hash"),
    responseLimit: integer("response_limit"),
    expiresAt: timestamp("expires_at"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [index("forms_owner_idx").on(table.ownerId)],
);

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
