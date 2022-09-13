/* eslint-disable @next/next/no-img-element */
import { useUser } from '@auth0/nextjs-auth0';
import {
    Alert,
    AppBar,
    Avatar,
    Button,
    Card,
    Container,
    IconButton,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import axios from 'axios';
import type { NextPage } from 'next';
import { useState } from 'react';
import { Dropzone } from '../components/Dropzone/Dropzone';
import { css } from '@emotion/css';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

const Home: NextPage = () => {
    const { user } = useUser();
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
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        News
                    </Typography>
                    {user ? (
                        <Button href="/api/auth/logout">Logout</Button>
                    ) : (
                        <Button href="/api/auth/login">Login</Button>
                    )}
                </Toolbar>
            </AppBar>

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
                            <img
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
                            <img
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
