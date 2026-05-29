import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import api from '../api/client';
import ListingCard from '../components/ListingCard';
import { neon } from '../theme';

function StatCard({ icon, value, label, color }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            color,
            bgcolor: `${color}1f`,
            boxShadow: `0 0 16px ${color}55`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/home')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />;
  }

  const { user, stats, recent_listings: recent } = data;

  return (
    <Stack spacing={4}>
      {/* Profile banner */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: `linear-gradient(135deg, ${neon.surface}, ${neon.surface2})`,
          border: `1px solid ${neon.cyan}33`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Avatar
            src={user.avatar_url || undefined}
            sx={{ width: 88, height: 88, border: `3px solid ${neon.cyan}`, boxShadow: `0 0 24px ${neon.cyan}66` }}
          >
            {user.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h3">{user.name}</Typography>
            <Typography color="primary">@{user.username}</Typography>
            {user.headline && (
              <Typography sx={{ mt: 1 }}>{user.headline}</Typography>
            )}
            {user.bio && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {user.bio}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<GroupRoundedIcon />}
            value={stats.connections}
            label="Connections"
            color={neon.cyan}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<StorefrontRoundedIcon />}
            value={stats.listings}
            label="Your listings"
            color={neon.magenta}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<MarkEmailUnreadRoundedIcon />}
            value={stats.pending_requests}
            label="Pending requests"
            color={neon.violet}
          />
        </Grid>
      </Grid>

      {/* Recent listings */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Your recent listings
        </Typography>
        {recent.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              You haven&apos;t advertised anything yet. Head to the Feed to post your first good.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {recent.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <ListingCard listing={{ ...listing, user }} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Stack>
  );
}
