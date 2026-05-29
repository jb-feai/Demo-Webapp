import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../auth/AuthContext';
import { neon } from '../theme';

const NAV = [
  { label: 'Home', value: '/', icon: <HomeRoundedIcon /> },
  { label: 'Feed', value: '/feed', icon: <StorefrontRoundedIcon /> },
  { label: 'Explore', value: '/explore', icon: <ExploreRoundedIcon /> },
];

function Logo() {
  return (
    <Typography
      variant="h5"
      sx={{
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 700,
        letterSpacing: 2,
        background: `linear-gradient(90deg, ${neon.cyan}, ${neon.magenta})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: `0 0 18px ${neon.cyan}55`,
      }}
    >
      NEON<span style={{ color: neon.magenta, WebkitTextFillColor: neon.magenta }}>MARKET</span>
    </Typography>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchor, setAnchor] = useState(null);

  const current = NAV.find((n) => n.value === location.pathname)?.value || '/';

  async function handleLogout() {
    setAnchor(null);
    await logout();
    navigate('/login');
  }

  return (
    <Box sx={{ pb: isMobile ? 9 : 0 }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Logo />

            {/* Desktop nav */}
            {!isMobile && (
              <Stack direction="row" spacing={1} sx={{ ml: 4, flexGrow: 1 }}>
                {NAV.map((item) => {
                  const active = current === item.value;
                  return (
                    <Box
                      key={item.value}
                      onClick={() => navigate(item.value)}
                      sx={{
                        cursor: 'pointer',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: active ? 'primary.main' : 'text.secondary',
                        bgcolor: active ? `${neon.cyan}14` : 'transparent',
                        transition: 'all .15s ease',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {item.icon}
                      <Typography fontWeight={600}>{item.label}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}

            <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

            <Tooltip title={user?.name || 'Account'}>
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar
                  src={user?.avatar_url || undefined}
                  sx={{ width: 38, height: 38, border: `2px solid ${neon.cyan}66` }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
              <MenuItem disabled>
                <Typography variant="body2">@{user?.username}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Outlet />
      </Container>

      {/* Mobile bottom nav */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }} elevation={0}>
          <BottomNavigation
            value={current}
            onChange={(_, value) => navigate(value)}
            showLabels
            sx={{ bgcolor: 'transparent' }}
          >
            {NAV.map((item) => (
              <BottomNavigationAction
                key={item.value}
                label={item.label}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
