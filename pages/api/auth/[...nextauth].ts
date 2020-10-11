import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { PrismaClient, User } from "@prisma/client";
import { createHmac } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

type AuthorizeDTO = {
  email: string;
  password: string;
  inviteCode?: string;
};

const prisma = new PrismaClient();

const hash = (password: string): string => {
  return createHmac("sha256", password).digest("hex");
};

const stripPassword = (user: User): Omit<User, "hashedPassword"> => {
  const { hashedPassword: _hashedPassword, ...sanitizedUser } = user;
  return sanitizedUser;
};

const options = {
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text", placeholder: "" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: AuthorizeDTO) => {
        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
        });
        if (!user) {
          // This is a new user, let's sign them up and authenticate them
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              hashedPassword: hash(credentials.password),
            },
          });
          return stripPassword(newUser);
        }
        // Verify that they are specifying a valid invite code
        if (user.hashedPassword === hash(credentials.password)) {
          // This is an existing user, let's see if their password matches
          return stripPassword(user);
        }
        // Password mismatch
        throw new Error("Invalid password");
      },
    }),
  ],

  database: process.env.DATABASE_URL,
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
};

export default (
  req: NextApiRequest,
  res: NextApiResponse<unknown>
): Promise<void> => NextAuth(req, res, options);
