import {
    AppBar,
    IconButton,
    Toolbar,
    Menu as MUIMenu,
    MenuItem,
    Typography,
    Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useUser } from '@auth0/nextjs-auth0';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const getPageTitle = (pathname: string) => {
    switch (pathname) {
        case '/':
            return 'Home';
        case '/gallery':
            return 'Gallery';
        default:
            return '';
    }
};

const Menu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const { user } = useUser();
    const router = useRouter();
    return (
        <AppBar component="nav">
            <Toolbar>
                {user && (
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={handleClick}
                        >
                            <MenuIcon />
                        </IconButton>
                        <MUIMenu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                        >
                            <MenuItem>
                                <Link href="/">Home</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link href="/gallery">Gallery</Link>
                            </MenuItem>
                        </MUIMenu>
                    </>
                )}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {getPageTitle(router.pathname)}
                </Typography>
                {user ? (
                    <>
                        <Typography
                            variant="body1"
                            sx={{ paddingRight: '2rem' }}
                        >
                            Welcome {user.name}
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            href="/api/auth/logout"
                        >
                            Logout
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        href="/api/auth/login"
                    >
                        Login
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export { Menu };
