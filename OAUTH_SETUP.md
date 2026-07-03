# OAuth Setup Guide

## Required Environment Variables
Add the following variables to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:8080/auth/google/callback"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:8080/auth/github/callback"
```

## OAuth Callback URLs
Configure the following callback URLs in your developer consoles:

- **Google Cloud Console**: `http://localhost:8080/auth/google/callback`
- **GitHub Developer Settings**: `http://localhost:8080/auth/github/callback`

## Notes
- To support account linking, ensure that the email returned by the provider matches the email of the existing account.
- When deploying to production, make sure to update these callback URLs and environment variables to match your live backend URL (e.g. `https://your-production-api.com/auth/google/callback`).
