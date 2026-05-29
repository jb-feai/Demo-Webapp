import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import api from '../api/client';
import { neon } from '../theme';

function ConnectButton({ person, onConnect }) {
  const conn = person.connection;
  if (conn?.status === 'accepted') {
    return <Chip icon={<CheckRoundedIcon />} label="Connected" color="success" variant="outlined" />;
  }
  if (conn?.status === 'pending') {
    const label = conn.direction === 'outgoing' ? 'Requested' : 'Responds to you';
    return <Chip label={label} variant="outlined" sx={{ color: neon.violet }} />;
  }
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<PersonAddRoundedIcon />}
      onClick={() => onConnect(person)}
    >
      Connect
    </Button>
  );
}

export default function Explore() {
  const [people, setPeople] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function loadPeople() {
    const { data } = await api.get('/explore', { params: { q: q || undefined } });
    setPeople(data.data || []);
  }

  async function loadRequests() {
    const { data } = await api.get('/explore/requests');
    setRequests(data || []);
  }

  useEffect(() => {
    Promise.all([loadPeople(), loadRequests()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(loadPeople, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function handleConnect(person) {
    await api.post(`/explore/${person.id}/connect`);
    setPeople((prev) =>
      prev.map((p) =>
        p.id === person.id ? { ...p, connection: { status: 'pending', direction: 'outgoing' } } : p,
      ),
    );
  }

  async function respond(request, action) {
    await api.post(`/explore/connections/${request.id}/respond`, { action });
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
    if (action === 'accept') loadPeople();
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h4">Social Explore</Typography>

      {/* Pending requests addressed to me */}
      {requests.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${neon.violet}44` }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Connection requests
          </Typography>
          <Stack divider={<Divider flexItem />} spacing={2}>
            {requests.map((req) => (
              <Stack
                key={req.id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={req.requester?.avatar_url || undefined}>
                    {req.requester?.name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={600}>{req.requester?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{req.requester?.username}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={() => respond(req, 'accept')}>
                    Accept
                  </Button>
                  <Button size="small" color="inherit" onClick={() => respond(req, 'decline')}>
                    Decline
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Search */}
      <TextField
        placeholder="Find people by name, username, or headline…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* People grid */}
      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={170} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2.5}>
          {people.map((person) => (
            <Grid item xs={12} sm={6} md={4} key={person.id}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      src={person.avatar_url || undefined}
                      sx={{ width: 56, height: 56, border: `2px solid ${neon.cyan}55` }}
                    >
                      {person.name?.[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>
                        {person.name}
                      </Typography>
                      <Typography variant="body2" color="primary" noWrap>
                        @{person.username}
                      </Typography>
                    </Box>
                  </Stack>
                  {person.headline && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {person.headline}
                    </Typography>
                  )}
                  {person.location && (
                    <Typography variant="caption" color="text.secondary">
                      📍 {person.location}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <ConnectButton person={person} onConnect={handleConnect} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
