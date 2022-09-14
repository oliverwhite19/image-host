import { NextApiRequest, NextApiResponse } from 'next';
import S3 from 'aws-sdk/clients/s3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const s3 = new S3({
    region: 'ca-central-1',
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    signatureVersion: 'v4',
});

const getFile = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Missing id' });
        }
        const image = await prisma.image.findUnique({ where: { id } });

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

    await prisma.$disconnect();
};

export default getFile;
