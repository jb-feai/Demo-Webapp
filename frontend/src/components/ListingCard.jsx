import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { formatPrice } from '../utils/format';
import { neon } from '../theme';

export default function ListingCard({ listing }) {
  const user = listing.user || {};
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="170"
          image={listing.image_url || 'https://picsum.photos/seed/neon/600/400'}
          alt={listing.title}
          sx={{ objectFit: 'cover' }}
        />
        {listing.is_promoted && (
          <Chip
            icon={<BoltRoundedIcon />}
            label="Promoted"
            size="small"
            color="secondary"
            sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 700 }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            {listing.title}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ whiteSpace: 'nowrap' }}>
            {formatPrice(listing.price_cents, listing.currency)}
          </Typography>
        </Stack>

        {listing.category && (
          <Chip label={listing.category} size="small" sx={{ mt: 1, color: neon.cyan }} />
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {listing.description}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <Avatar src={user.avatar_url || undefined} sx={{ width: 26, height: 26 }}>
            {user.name?.[0]}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            @{user.username}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
