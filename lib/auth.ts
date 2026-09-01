import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { username } from "better-auth/plugins"
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),

  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 90, // 90 days
    updateAge: 60 * 60 * 24 * 7, // 7 days
  },

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(schema.user_settings).values({
            userId: user.id,
          });
        },
      },
    },
  },

  plugins: [username()],
});
