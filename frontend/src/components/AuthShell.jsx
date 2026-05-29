import { Box, Paper, Typography } from '@mui/material';
import { neon } from '../theme';

// Centered glowing card used by the Login and Create Account screens.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: `1px solid ${neon.cyan}33`,
          boxShadow: `0 0 0 1px ${neon.cyan}22, 0 24px 80px ${neon.violet}33`,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 0.5,
            background: `linear-gradient(90deg, ${neon.cyan}, ${neon.magenta})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Paper>
    </Box>
  );
}
