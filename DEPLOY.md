# Deploy to Vercel

## Quick Deploy (One Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/github-city)

## Deploy from GitHub

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/github-city.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite settings
   - Click **Deploy**

## Deploy from CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (development)
vercel

# Deploy to production
vercel --prod
```

## Environment Variables (Optional)

If you want to add a GitHub token for higher API limits:

```bash
# In Vercel Dashboard → Project Settings → Environment Variables
GITHUB_TOKEN=your_github_personal_access_token
```

Then update `githubApi.js` to use it.

## Updating Your Deployment

### Update CSV Data
1. Edit `public/github_data.csv`
2. Update dates in the `last_updated` column
3. Commit and push - Vercel auto-deploys!

```bash
git add public/github_data.csv
git commit -m "Update data: $(date +%Y-%m-%d)"
git push
```

## Custom Domain

1. Vercel Dashboard → Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## Troubleshooting

### Build Fails
```bash
# Test build locally
npm run build

# Check for errors
npm run build 2>&1
```

### CSV Not Loading
- Ensure `github_data.csv` is in `public/` folder
- Check browser console for 404 errors
- Verify file is in the build: `ls dist/*.csv`

### API Rate Limits
GitHub API has 60 requests/hour per IP. If you hit limits:
- Add a GitHub personal access token
- Or implement server-side API routes (see `api/` folder setup)

## Project Structure on Vercel

```
├── dist/              # Build output (auto-generated)
├── public/            # Static assets
│   └── github_data.csv
├── src/               # Source code
├── vercel.json        # Vercel config
└── vite.config.js     # Vite config
```

## Performance Tips

- CSV is cached for 1 hour (configurable in `vercel.json`)
- Assets cached for 1 year (hashed filenames)
- Enable Vercel Analytics for insights

---

**Live URL:** `https://github-city-yourusername.vercel.app`
