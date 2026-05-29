import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import api from '../api/client';
import ListingCard from '../components/ListingCard';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Art', 'Gaming'];

const EMPTY = {
  title: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  is_promoted: false,
};

export default function Feed() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/feed', { params: { q: q || undefined, category: category || undefined } });
      setListings(data.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search/filter
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  const update = (key) => (e) =>
    setForm({ ...form, [key]: key === 'is_promoted' ? e.target.checked : e.target.value });

  async function submit() {
    setSaving(true);
    try {
      await api.post('/feed', {
        title: form.title,
        description: form.description,
        price_cents: Math.round(parseFloat(form.price || '0') * 100),
        category: form.category || null,
        image_url: form.image_url || null,
        is_promoted: form.is_promoted,
      });
      setOpen(false);
      setForm(EMPTY);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="h4">Marketplace Feed</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          Advertise a good
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          placeholder="Search goods…"
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
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: { sm: 200 } }}
        >
          <MenuItem value="">All categories</MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No goods match your search.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* New listing dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Advertise a good</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={update('title')} required fullWidth />
            <TextField
              label="Description"
              value={form.description}
              onChange={update('description')}
              multiline
              minRows={2}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={update('price')}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <TextField select label="Category" value={form.category} onChange={update('category')} fullWidth>
                <MenuItem value="">None</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField label="Image URL" value={form.image_url} onChange={update('image_url')} fullWidth />
            <FormControlLabel
              control={<Switch checked={form.is_promoted} onChange={update('is_promoted')} color="secondary" />}
              label="Promote this listing (pin to top of feed)"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={saving || !form.title}>
            {saving ? 'Posting…' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
