import { createTheme, alpha } from '@mui/material/styles';

// Clean neon theme: deep near-black canvas, cyan + magenta accents,
// crisp typography, soft glow on interactive surfaces.
const neon = {
  cyan: '#00e5ff',
  magenta: '#ff2bd6',
  violet: '#7c4dff',
  bg: '#0a0e17',
  surface: '#111726',
  surface2: '#161e30',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: neon.cyan, contrastText: '#04121a' },
    secondary: { main: neon.magenta, contrastText: '#1a0414' },
    info: { main: neon.violet },
    background: { default: neon.bg, paper: neon.surface },
    text: { primary: '#e8f0ff', secondary: alpha('#e8f0ff', 0.6) },
    divider: alpha(neon.cyan, 0.12),
    success: { main: '#22e6a4' },
    warning: { main: '#ffcf4d' },
    error: { main: '#ff5277' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Rajdhani", "Segoe UI", system-ui, sans-serif',
    h1: { fontFamily: '"Orbitron", sans-serif', fontWeight: 700, letterSpacing: 1 },
    h2: { fontFamily: '"Orbitron", sans-serif', fontWeight: 700, letterSpacing: 1 },
    h3: { fontFamily: '"Orbitron", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Orbitron", sans-serif', fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600, letterSpacing: 0.4 },
    button: { fontWeight: 600, letterSpacing: 0.6, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `radial-gradient(1200px 600px at 80% -10%, ${alpha(
            neon.violet,
            0.18,
          )}, transparent 60%), radial-gradient(900px 500px at -10% 110%, ${alpha(
            neon.magenta,
            0.14,
          )}, transparent 55%), ${neon.bg}`,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '::selection': { background: alpha(neon.cyan, 0.35) },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: neon.surface,
          border: `1px solid ${alpha(neon.cyan, 0.12)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: neon.surface,
          border: `1px solid ${alpha(neon.cyan, 0.14)}`,
          transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
          '&:hover': {
            borderColor: alpha(neon.cyan, 0.4),
            boxShadow: `0 0 0 1px ${alpha(neon.cyan, 0.25)}, 0 12px 40px ${alpha(
              neon.cyan,
              0.12,
            )}`,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: `0 0 18px ${alpha(neon.cyan, 0.5)}`,
          '&:hover': { boxShadow: `0 0 26px ${alpha(neon.cyan, 0.8)}` },
        },
        containedSecondary: {
          boxShadow: `0 0 18px ${alpha(neon.magenta, 0.5)}`,
          '&:hover': { boxShadow: `0 0 26px ${alpha(neon.magenta, 0.8)}` },
        },
        outlined: { borderColor: alpha(neon.cyan, 0.4) },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(neon.bg, 0.7),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(neon.cyan, 0.15)}`,
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { border: `1px solid ${alpha(neon.cyan, 0.25)}` },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': { borderColor: alpha(neon.cyan, 0.25) },
          '&:hover fieldset': { borderColor: alpha(neon.cyan, 0.5) },
        },
      },
    },
  },
});

export default theme;
export { neon };
