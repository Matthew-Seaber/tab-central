import {
  pgTable,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

import { randomUUID } from "crypto";

export const user = pgTable("user", {
  id: text("id").default(randomUUID()).primaryKey(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").default(randomUUID()).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const user_settings = pgTable("user_settings", {
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  showQuickLinks: boolean("show_quick_links").default(true).notNull(),
  defaultSearchMode: text("default_search_mode").default("Normal").notNull(),
});
