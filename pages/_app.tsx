import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../libs/browser/theme';
import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../libs/browser/createEmotionCache';

const clientSideEmotionCache = createEmotionCache();

function MyApp(props: AppProps & { emotionCache?: any }) {
    const {
        Component,
        emotionCache = clientSideEmotionCache,
        pageProps,
    } = props;
    return (
        <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
                <UserProvider>
                    <Head>
                        <meta
                            name="viewport"
                            content="initial-scale=1, width=device-width"
                        />
                    </Head>
                    <CssBaseline />
                    <Component {...pageProps} />
                </UserProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default MyApp;
