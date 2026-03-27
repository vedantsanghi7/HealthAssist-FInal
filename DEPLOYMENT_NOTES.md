# Deployment Notes

## Admin Doctor Verification
When deploying to Vercel (or your production domain), ensure that you update the base URL in the email sent to `healthassistpilani@gmail.com`.
Right now, the "Verify" button link uses `http://localhost:3000`.

To fix this for production, ensure you have the `NEXT_PUBLIC_APP_URL` environment variable set in Vercel to your production domain (e.g. `https://your-domain.com`).
The code uses `process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'` so it will automatically work in production if the env var is set.
