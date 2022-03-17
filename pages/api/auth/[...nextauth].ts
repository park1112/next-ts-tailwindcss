import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../../../lib/auth"

let prisma = new PrismaClient();

export default NextAuth({
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "유저 이메일", type: "email", placeholder: "jsmith@naver.com" },
                password: { label: "비밀번호", type: "password" }
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: String(credentials.email),
                    },
                    select: {
                        name: true, email: true, password: true
                    },
                });

                if (!user) {
                    throw new Error('No user found!');
                }

                const isValid = await verifyPassword(
                    credentials.password,
                    user.password
                );

                if (!isValid) {
                    throw new Error('Could not log you in!');
                }
                return { name: user.name, email: user.email };
            }
            
        })
    ],
    secret: process.env.SECRET,
})