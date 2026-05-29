import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setErrors({});
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setError(err.response?.data?.message || 'Could not create your account.');
      }
    } finally {
      setBusy(false);
    }
  }

  const fieldError = (key) => errors[key]?.[0];

  return (
    <AuthShell title="Join NeonMarket" subtitle="Create an account to connect and trade">
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.25}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Full name"
            value={form.name}
            onChange={update('name')}
            error={Boolean(fieldError('name'))}
            helperText={fieldError('name')}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={update('username')}
            error={Boolean(fieldError('username'))}
            helperText={fieldError('username') || 'Letters, numbers, dashes'}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={update('email')}
            error={Boolean(fieldError('email'))}
            helperText={fieldError('email')}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={update('password')}
            error={Boolean(fieldError('password'))}
            helperText={fieldError('password')}
            required
            fullWidth
          />
          <TextField
            label="Confirm password"
            type="password"
            value={form.password_confirmation}
            onChange={update('password_confirmation')}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" disabled={busy} fullWidth>
            {busy ? 'Creating…' : 'Create account'}
          </Button>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already a member?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthShell>
  );
}
