# Cache Admin Panel

Hidden admin page to inspect and manage Chirpy's voice cache.

## Access

The cache admin panel is protected by an admin token. Access it with:

```
https://awakened-path-2026.web.app/?admin=YOUR_ADMIN_TOKEN
```

Or set the token once in localStorage:
```javascript
localStorage.setItem('admin_token', 'YOUR_ADMIN_TOKEN');
```

### Getting Your Admin Token

The admin token is stored in Google Cloud Secret Manager as `ADMIN_TOKEN`. Ask a project admin for the token value.

## Features

### View Cache Statistics

- **Total Cached Files**: How many voice audios are stored
- **Characters**: Number of different voice characters (grownup, mind, guide)
- **Emotions**: How many different emotional variants are cached

### Breakdown by Character

Shows how many cached entries for each character:
- `grownup` - The main narrator voice
- `mind` - The child's own thoughts (whispered)
- `guide` - Meditation guide voice (deep, slow)

### Breakdown by Emotion

Shows cache usage by emotion. Each row can be individually deleted:
- `sad` - Heavy, slow whisper
- `happy` - Bright, quick, smiling whisper
- `angry` - Tight, huffy whisper
- `worried` - Tiny, shaky whisper
- `shy` - Very small, mumbling whisper
- `jealous` - Sulky, grumbly whisper
- `bored` - Flat, drawn-out whisper
- `calm` - Easy, settled, warm whisper
- `plain` - Default emotion (no special tone)

### Manage Cache

**Clear entries by age:**
- Clear entries older than 7 days
- Clear entries older than 30 days
- Clear entries older than 90 days

**Clear entries by emotion:**
- Click 🗑️ next to any emotion to delete all entries for that emotion

## How Caching Works

Each voice file is cached with a unique key:
```
SHA256(text | voiceName | character | emotion)
```

For example:
- Same thought + same emotion = Cached instantly
- Same thought + different emotion = New synthesis
- Different thought + same emotion = New synthesis if not already cached

### Cache Storage

- **Metadata**: Stored in Firestore `chirpyVoiceCache` collection
- **Audio**: Stored in Firebase Storage (30-day CDN cache)
- **Reuse**: Cached within sessions and across days

## Cloud Functions

Three admin endpoints (all require `X-Admin-Token` header):

1. **GET /api/admin/cache-stats**
   - Returns cache statistics and recent entries

2. **POST /api/admin/cache-clear**
   - Body: `{ "daysOld": 30 }`
   - Clears entries older than specified days

3. **POST /api/admin/cache-by-emotion**
   - Body: `{ "emotion": "sad" }`
   - Clears all entries for a specific emotion

## Environment Setup

Set the admin token in Firebase Cloud Functions config:

```bash
firebase functions:config:set admin.token="YOUR_SECRET_TOKEN"
firebase deploy --only functions
```

Or set as environment variable:
```bash
ADMIN_TOKEN=YOUR_SECRET_TOKEN firebase emulate:hosting
```

## Integration into App

To add the cache admin page to the app:

```typescript
import { CacheAdmin } from './admin';

// In your routing/nav:
if (view === 'admin') {
  return <CacheAdmin />;
}
```

Or add a hidden admin button to BestApp that shows on specific conditions.

## Security Notes

⚠️ **Important**: Never commit the admin token to version control. Always use environment variables and Firebase Secret Manager.

The panel checks authorization on:
1. Frontend: Validates token against `REACT_APP_ADMIN_TOKEN`
2. Backend: Cloud Functions verify `X-Admin-Token` header
3. Firestore: Rules can further restrict admin access

## Future Enhancements

- [ ] Export cache stats to CSV
- [ ] Visual chart of cache growth over time
- [ ] Search cache by text keyword
- [ ] Manually trigger cache warming
- [ ] Set cache retention policies automatically
- [ ] Monitor Gemini API budget usage per emotion
