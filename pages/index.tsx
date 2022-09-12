/* eslint-disable @next/next/no-img-element */
import axios from 'axios';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
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
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <p>Please select a file to upload</p>
                <input type="file" onChange={(e) => selectFile(e)} />
                {file && (
                    <>
                        <p>Selected file: {file.name}</p>

                        <button
                            onClick={uploadFile}
                            className="bg-purple-500 text-white p-2 rounded-sm shadow-md hover:bg-purple-700 transition-all"
                        >
                            Upload a File!
                        </button>
                    </>
                )}
                {uploadingStatus && <p>{uploadingStatus}</p>}
                {uploadedFile && (
                    <img src={uploadedFile} alt="Your uploaded image" />
                )}
            </main>
        </div>
    );
};

export default Home;
