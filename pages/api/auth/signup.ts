import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Loading prisma client
    let prisma = new PrismaClient();

    if (req.method !== 'POST') {
        return;
    }

    const data = req.body;

    const { name, email, password } = data;

    if (
        !name ||
        !email ||
        !email.includes('@') ||
        !password ||
        password.trim().length < 7
    ) {
        res.status(422).json({
            message:
                'password should also be at least 7 characters long.',
            error: true,
        });
        return;
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
        select: {
            email: true, name: true,
        }
    }
    );

    if (existingUser) {
        res.status(422).json({ message: 'User Email already exists!', error: true });
        return;
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        },
    });

    if (result) {
        res.status(201).json({ message: 'Created user!', error: false });
    } else {
        res.status(422).json({ message: 'Prisma error occured', error: true })
    }
}

export default handler;