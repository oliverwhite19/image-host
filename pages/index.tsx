/* eslint-disable @next/next/no-img-element */
import { useUser } from '@auth0/nextjs-auth0';
import axios from 'axios';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
    const { user, error, isLoading } = useUser();
    const [file, setFile] = useState<any>();
    const [uploadingStatus, setUploadingStatus] = useState<any>();
    const [uploadedFile, setUploadedFile] = useState<any>();

    const selectFile = (e: any) => {
        setFile(e.target.files[0]);
    };

    const uploadFile = async () => {
        setUploadingStatus('Uploading the file to AWS S3');
        const formData = new FormData();
        formData.append('image', file);
        let { data } = await axios.post('/api/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setUploadedFile(`/api/image/${data.id}`);
        setFile(null);
    };

    return (
        <div>
            {user ? (
                <div>
                    <img src={user.picture ?? ''} alt={user.name ?? ''} />
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <a href="/api/auth/logout">Logout</a>
                </div>
            ) : (
                <a href="/api/auth/login">Login</a>
            )}

            <p>Please select a file to upload</p>
            <input type="file" onChange={(e) => selectFile(e)} />
            {file && (
                <>
                    <p>Selected file: {file.name}</p>

                    <button onClick={uploadFile}>Upload a File!</button>
                </>
            )}
            {uploadingStatus && <p>{uploadingStatus}</p>}
            {uploadedFile && (
                <img src={uploadedFile} alt="Your uploaded image" />
            )}
        </div>
    );
};

export default Home;
