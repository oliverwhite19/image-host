import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { css } from '@emotion/css';
import { Container } from '@mui/system';
import { PrismaClient } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Header } from '../../components/Header/Header';
import { Image } from '../../components/Image/Image';
import { Menu } from '../../components/Menu/Menu';

interface ImagePageProps {
    image?: {
        id: string;
        visibility: string;
        createdAt: string;
        updatedAt: string;
    };
}

const ImagePage = ({ image }: ImagePageProps) => {
    const router = useRouter();
    useEffect(() => {
        if (!image) {
            router.replace('/gallery');
        }
    }, [image, router]);
    return (
        <>
            <Header title={'Image Upload'} />
            <Menu />
            <Container
                maxWidth="sm"
                className={css`
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    width: 100vw;
                `}
            >
                <Image
                    src={`/api/image/${image?.id}`}
                    alt="image"
                    className={css`
                        max-width: 75%;
                        max-height: 75%;
                    `}
                />
            </Container>
        </>
    );
};

export const getServerSideProps = withPageAuthRequired({
    returnTo: '/',
    async getServerSideProps(ctx) {
        const prisma = new PrismaClient();
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
                image: image
                    ? {
                          id: image?.id,
                          visibility: image?.visibility,
                          createdAt: image?.createdAt.toISOString(),
                          updatedAt: image?.updatedAt.toISOString(),
                      }
                    : null,
            },
        };
    },
});

export default ImagePage;
