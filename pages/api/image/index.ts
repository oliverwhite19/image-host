import { NextApiRequest, NextApiResponse } from 'next';
import S3 from 'aws-sdk/clients/s3';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { uid } from '../../../libs/server/id.server';
import md5 from 'md5';
import mime from 'mime-types';

const prisma = new PrismaClient();
const s3 = new S3({
    region: 'ca-central-1',
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    signatureVersion: 'v4',
});

const index = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
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

export const config = {
    api: {
        bodyParser: false,
    },
};

export default index;
