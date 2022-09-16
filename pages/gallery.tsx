import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Container, Pagination } from '@mui/material';
import { css } from '@emotion/css';
import { useEffect, useState } from 'react';
import { Menu } from '../components/Menu/Menu';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Image } from '../components/Image/Image';
import Link from 'next/link';
import { Header } from '../components/Header/Header';

const Gallery = () => {
    const [images, setImages] = useState<{
        images: Array<{ id: string }>;
        totalPages: number;
    } | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/image?page=${page}`)
            .then((res) => res.json())
            .then((data) => {
                setImages(data);
                setLoading(false);
            });
    }, [page]);
    return (
        <>
            <Header title={'Image Upload Gallery'} />
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
                <Grid2
                    container
                    spacing={{ xs: 2, md: 3 }}
                    columns={{ xs: 4, sm: 12, md: 16 }}
                >
                    {!isLoading &&
                        images?.images.map((image) => (
                            <Grid2 xs={2} sm={4} md={4} key={image.id}>
                                <Link href={`/image/${image.id}`}>
                                    <Image
                                        src={`/api/image/${image.id}`}
                                        alt="image"
                                        className={css`
                                            max-width: 100%;
                                            max-height: 100%;
                                        `}
                                    />
                                </Link>
                            </Grid2>
                        ))}
                </Grid2>
                {(images?.totalPages ?? 0) > 1 && (
                    <Pagination
                        count={images?.totalPages}
                        page={page}
                        onChange={(
                            _: React.ChangeEvent<unknown>,
                            value: number
                        ) => {
                            setPage(value);
                        }}
                    />
                )}
            </Container>
        </>
    );
};

export const getServerSideProps = withPageAuthRequired();

export default Gallery;
