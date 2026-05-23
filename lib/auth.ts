import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { ac, appRoles, roleOptions } from "@/lib/auth-permissions";
import type { AppRole } from "@/lib/auth-permissions";

const mongoUri = process.env.MONGO_URI;
const baseURL = process.env.BETTER_AUTH_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);

if (!mongoUri) {
  console.warn("Missing MONGO_URI environment variable — Better Auth Mongo adapter will not be configured.");
}

const client = mongoUri ? new MongoClient(mongoUri) : (null as unknown as MongoClient);
const database = mongoUri ? client.db() : (null as unknown);

export const auth = betterAuth({
  baseURL,
  ...(mongoUri
    ? { database: mongodbAdapter(database as any, { client }) }
    : {}),
  experimental: {
    joins: true,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      console.info(`Password reset link for ${user.email}: ${url}`);
    },
  },
  user: {
    additionalFields: {
      requestedRole: {
        type: roleOptions,
        required: false,
        defaultValue: "student",
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const requestedRole = roleOptions.includes(user.requestedRole as AppRole)
            ? (user.requestedRole as AppRole)
            : "student";
          const isAdminCreatingUser = ctx?.context?.session?.user?.role === "admin";
          const { requestedRole: _requestedRole, ...restUser } = user;

          if (!isAdminCreatingUser && requestedRole === "admin") {
            return {
              data: {
                ...restUser,
                role: "student",
              },
            };
          }

          return {
            data: {
              ...restUser,
              role: requestedRole,
            },
          };
        },
      },
    },
  },
  plugins: [
    admin({
      ac,
      roles: appRoles,
      defaultRole: "student",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthRole = AppRole;