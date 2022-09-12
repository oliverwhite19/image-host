// pages/api/auth/[...auth0].js
import {
    handleAuth,
    handleCallback,
    handleLogin,
    Session,
} from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

const afterCallback = async (
    _req: NextApiRequest,
    _res: NextApiResponse,
    session: Session,
    _state?: {
        [key: string]: any;
    }
) => {
    const { user } = session;
    const existingUser = await prisma.user.findUnique({
        where: { identifier: user.sub },
    });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                identifier: user.sub,
                email: user.email,
            },
        });
    }
    return session;
};

export default handleAuth({
    async callback(req, res) {
        await handleCallback(req, res, { afterCallback });
    },
});
