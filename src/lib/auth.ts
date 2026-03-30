import dns from "node:dns";
import { betterAuth } from "better-auth";
import { admin, genericOAuth } from "better-auth/plugins";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
const wikraAuthUrl = process.env.WIKRA_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  baseURL: appUrl,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  advanced: {
    cookiePrefix: "expense-tracker",
  },
  account: {
    skipStateCookieCheck: true,
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "wikra-auth",
          clientId: process.env.WIKRA_AUTH_CLIENT_ID || "expense-tracker",
          clientSecret: process.env.WIKRA_AUTH_CLIENT_SECRET!,
          discoveryUrl: `${wikraAuthUrl}/api/auth/.well-known/openid-configuration`,
          scopes: ["openid", "profile", "email"],
        },
      ],
    }),
    admin({
      defaultRole: "user",
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [
    appUrl,
    wikraAuthUrl,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
