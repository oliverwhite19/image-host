import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { CssTwoTone } from '@mui/icons-material';
import { PrismaClient } from '@prisma/client';
import { Image } from '../../components/Image/Image';
import { Menu } from '../../components/Menu/Menu';

interface ImagePageProps {
    image: {
        id: string;
        visibility: string;
        createdAt: string;
        updatedAt: string;
    };
}

const ImagePage = ({ image }: ImagePageProps) => {
    console.log(image);
    return (
        <>
            <Menu />
            <Image src={`/api/image/${image.id}`} alt="image" />
        </>
    );
};

export const getServerSideProps = withPageAuthRequired({
    returnTo: '/',
    async getServerSideProps(ctx) {
        const prisma = new PrismaClient();
        // access the user session
        console.log(ctx);

        ctx.query.id;

        const session = getSession(ctx.req, ctx.res);
        const user = await prisma.user.findUnique({
            where: {
                identifier: session?.user.sub,
            },
        });
        const image = await prisma.image.findFirst({
            where: {
                id: (ctx.query.id as string) ?? '',
                ownerId: user?.id,
            },
        });

        prisma.$disconnect();
        return {
            props: {
                image: {
                    id: image?.id,
                    visibility: image?.visibility,
                    createdAt: image?.createdAt.toISOString(),
                    updatedAt: image?.updatedAt.toISOString(),
                },
            },
        };
    },
});

export default ImagePage;
