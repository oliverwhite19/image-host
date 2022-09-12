import { NextApiRequest, NextApiResponse } from 'next';
import S3 from 'aws-sdk/clients/s3';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, User } from '@prisma/client';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { uid } from '../../../libs/server/id.server';
import md5 from 'md5';
import mime from 'mime-types';
import { getSession } from '@auth0/nextjs-auth0';

const prisma = new PrismaClient();
const s3 = new S3({
    region: 'ca-central-1',
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    signatureVersion: 'v4',
});

const post = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getSession(req, res);
        let user: User | null = null;
        if (session) {
            user = await prisma.user.findUnique({
                where: { identifier: session.user.sub },
            });
        }

        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            const file = files['image'] as File;
            const fileExtension = mime.extension(file.mimetype ?? '');

            const fileParams = {
                Bucket: process.env.BUCKET_NAME ?? '',
                Key: `${uuidv4()}.${fileExtension}`,
                ContentType: file.mimetype ?? '',
                Body: fs.readFileSync(file.filepath),
            };
            const hash = md5(fileParams.Body);

            const sameHash = await prisma.image.findFirst({
                where: { hash },
            });
            if (!sameHash) {
                // @ts-ignore-next-line
                s3.upload(fileParams, async (_err, data) => {
                    if (err) {
                        throw err;
                    }
                    const image = await prisma.image.create({
                        data: {
                            id: `${uid()}.${fileExtension}`,
                            ownerId: user?.id,
                            fileId: data.key,
                            hash,
                        },
                    });
                    res.status(200).json({ id: image.id });
                });
            } else {
                const image = await prisma.image.create({
                    data: {
                        id: `${uid()}.${fileExtension}`,
                        ownerId: user?.id,
                        fileId: sameHash.fileId,
                        hash,
                    },
                });
                res.status(200).json({ id: image.id });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
};

const get = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getSession(req, res);
        if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await prisma.user.findUniqueOrThrow({
            where: { identifier: session.user.sub },
        });

        const { page } = req.query;
        const results = await prisma.image.findMany({
            skip: page ? (Number(page) - 1) * 20 : 0,
            take: 20,
            where: { ownerId: user.id },
        });
        res.status(200).json(
            results.map((result) => {
                return {
                    id: result.id,
                    visibility: result.visibility,
                    lastViewedAt: result.lastViewedAt,
                };
            })
        );
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
};

const index = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'POST':
            return post(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default index;
