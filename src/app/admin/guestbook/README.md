# Guestbook Moderation

This admin interface allows you to moderate the guestbook entries by viewing all comments and removing inappropriate content.

## Setup

1. Make sure you have the following environment variables set in your `.env.local` file:

```
# GitHub Token for API access
GITHUB_TOKEN=your_github_token_here

# Admin secret for moderating the guestbook
ADMIN_SECRET=your_secure_admin_secret_here
```

2. The `ADMIN_SECRET` should be a secure, random string that only administrators know.

## Usage

1. Navigate to `/admin/guestbook` in your browser
2. Enter the admin secret to authenticate
3. View all guestbook entries
4. Delete any inappropriate or spam comments by clicking the "Delete" button

## Security

- The admin interface is protected by the `ADMIN_SECRET` environment variable
- All admin API requests require authentication with this secret
- Make sure to keep your admin secret secure and don't share it publicly

