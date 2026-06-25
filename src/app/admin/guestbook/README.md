# Guestbook Moderation

This admin interface allows you to moderate the guestbook entries by viewing all comments and removing inappropriate content.

## Setup

1. Make sure you have the following environment variables set in your `.env.local` file:

```
# GitHub Token for API access
GITHUB_TOKEN=your_github_token_here

# Admin secret for moderating the guestbook
ADMIN_SECRET=your_secure_admin_secret_here

# Discord OAuth (optional — lets visitors sign guestbook entries with their profile)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

2. The `ADMIN_SECRET` should be a secure, random string that only administrators know.

### Discord OAuth setup (optional)

Visitors can optionally sign new guestbook entries with Discord. Existing entries are unchanged and keep their Dicebear avatars.

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) and open your application (or create one).
2. **OAuth2 → General**
   - Copy **Client ID** → `DISCORD_CLIENT_ID`
   - Copy **Client Secret** → `DISCORD_CLIENT_SECRET`
3. **OAuth2 → Redirects** — add these URLs (all of them):
   - `https://rohan.run/api/guestbook/discord/callback`
   - `https://rohanpothuru.com/api/guestbook/discord/callback`
   - Local dev: `http://localhost:3000/api/guestbook/discord/callback`
4. **OAuth2 → URL Generator** (for reference — the app builds this automatically):
   - Scopes: **`identify`** only
   - No bot scope, no guild scopes, no privileged intents needed
5. Restart your dev server after adding env vars.

The `identify` scope gives read-only access to the signed-in user's username, display name, and avatar — nothing else.

## Usage

1. Navigate to `/admin/guestbook` in your browser
2. Enter the admin secret to authenticate
3. View all guestbook entries
4. Delete any inappropriate or spam comments by clicking the "Delete" button

## Security

- The admin interface is protected by the `ADMIN_SECRET` environment variable
- All admin API requests require authentication with this secret
- Make sure to keep your admin secret secure and don't share it publicly
- Discord profile data is verified server-side via OAuth; clients cannot spoof avatars
