/* eslint-disable @next/next/no-img-element */
import {
    Alert,
    Button,
    Card,
    Container,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import axios from 'axios';
import type { NextPage } from 'next';
import { useState } from 'react';
import { Dropzone } from '../components/Dropzone/Dropzone';
import { css } from '@emotion/css';
import CloseIcon from '@mui/icons-material/Close';
import { Menu } from '../components/Menu/Menu';
import { Image } from '../components/Image/Image';

const Home: NextPage = () => {
    const [file, setFile] = useState<any>();
    const [openSuccess, setOpenSuccess] = useState(false);
    const [uploadingStatus, setUploadingStatus] = useState<any>();
    const [uploadedFile, setUploadedFile] = useState<any>();

    const uploadFile = async () => {
        setUploadingStatus('Uploading to the server...');
        const formData = new FormData();
        formData.append('image', file);
        let { data } = await axios.post('/api/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setUploadedFile(`/api/image/${data.id}`);
        setFile(null);
        setUploadingStatus(undefined);
        setOpenSuccess(true);
    };

    return (
        <>
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
                <Card variant="outlined">
                    <Stack
                        direction="column"
                        justifyContent="space-around"
                        alignItems="center"
                        spacing={2}
                        className={css`
                            padding: 1rem;
                            min-height: 25vh;
                        `}
                    >
                        {openSuccess && (
                            <Alert
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setOpenSuccess(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                                sx={{ mb: 2 }}
                            >
                                File uploaded!
                            </Alert>
                        )}
                        <Dropzone onDrop={(e) => setFile(e[0])} />
                        {file && (
                            <Image
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className={css`
                                    max-height: 500px;
                                    max-width: 500px;
                                    height: auto;
                                    width: auto;
                                `}
                            />
                        )}
                        {!file && uploadedFile && (
                            <Image
                                src={uploadedFile}
                                alt="Your uploaded image"
                                className={css`
                                    max-height: 500px;
                                    max-width: 500px;
                                    height: auto;
                                    width: auto;
                                `}
                            />
                        )}
                        {uploadingStatus && (
                            <Typography>{uploadingStatus}</Typography>
                        )}
                        {file && (
                            <Button variant="contained" onClick={uploadFile}>
                                Upload
                            </Button>
                        )}
                    </Stack>
                </Card>
            </Container>
        </>
    );
};

export default Home;
