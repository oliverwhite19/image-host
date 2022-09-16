import { NextApiRequest, NextApiResponse } from 'next';
import S3 from 'aws-sdk/clients/s3';
import { PrismaClient, User } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';

const prisma = new PrismaClient();
const s3 = new S3({
    region: 'ca-central-1',
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    signatureVersion: 'v4',
});

const get = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Missing id' });
        }

        const session = await getSession(req, res);
        let user: User | null = null;
        if (session) {
            user = await prisma.user.findUnique({
                where: { identifier: session.user.sub },
            });
        }
        const image = await prisma.image.findFirst({
            where: {
                OR: [
                    {
                        visibility: 'PUBLIC',
                    },
                    {
                        visibility: 'PROTECTED',
                    },
                    {
                        visibility: 'PRIVATE',
                        ownerId: user?.id,
                    },
                ],
                AND: {
                    deleted: null,
                    id,
                },
            },
        });

        const fileParams = {
            Bucket: process.env.BUCKET_NAME ?? '',
            Key: image?.fileId ?? '',
        };
        const file = await s3.getObject(fileParams);

        file.createReadStream().pipe(res);

        await prisma.image.update({
            where: { id },
            data: {
                views: image?.views ? image.views + 1 : 1,
                lastViewedAt: new Date(),
            },
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
};

const deleteImge = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Missing id' });
        }
        const session = await getSession(req, res);
        const user = await prisma.user.findFirstOrThrow({
            where: { identifier: session?.user.sub },
        });
        const image = await prisma.image.findFirst({
            where: { id, ownerId: user?.id },
        });
        if (!image) {
            return res.status(400).json({ message: 'Image not found' });
        }

        const otherImages = await prisma.image.findMany({
            where: { fileId: image.fileId, deleted: null },
        });
        if (otherImages.length === 1) {
            const fileParams = {
                Bucket: process.env.BUCKET_NAME ?? '',
                Key: image.fileId,
            };
            await s3.deleteObject(fileParams);
        }
        // await prisma.image.update({
        //     where: { id: image.id },
        //     data: { deleted: new Date() },
        // });
        res.status(200).json({ message: 'Image deleted' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
};

const image = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET':
            get(req, res);
            break;
        case 'DELETE':
            deleteImge(req, res);
            break;
        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
    await prisma.$disconnect();
};

export const config = {
    api: {
        responseLimit: '10mb',
    },
};

export default image;
