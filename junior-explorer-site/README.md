# EdWorld Co. — Junior & Explorer Standalone Site

This is the standalone marketing deployment for:
- `junior.edworld.co.in` (Ages 13–15)
- `explorer.edworld.co.in` (Ages 16–18)

## Architecture & Integration
1. **Live Supabase Sync**: Pulls headlines, subtext, and feature highlights dynamically from the shared Supabase project's `landing_sector_pages` and `landing_feature_highlights` tables (`sector = 'junior'` and `sector = 'explorer'`).
2. **Centralized Auth**: All "Sign In" and "Get Started" CTAs point to the central EdWorld platform (`https://edworldco.in/login` and `https://edworldco.in/signup?intent=junior|explorer`).
3. **No Auth Cookies / Decoupled**: Completely decoupled from internal app routing and authentication cookies.

## Deployment Setup
- **Vercel / Hosting**: Deploy as a separate project with root directory set to `junior-explorer-site`.
- **Domains**: Add `junior.edworld.co.in` and `explorer.edworld.co.in` in the Vercel project domain settings.
- **GoDaddy DNS**: Point CNAME records for `junior` and `explorer` to `cname.vercel-dns.com`.
