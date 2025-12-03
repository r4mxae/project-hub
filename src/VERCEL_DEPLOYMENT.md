# Vercel Deployment Guide

Complete guide to deploying your Project Hub application to Vercel.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. ✅ A [Vercel account](https://vercel.com/signup) (free tier works great!)
2. ✅ [Git installed](https://git-scm.com/) on your computer
3. ✅ A [GitHub account](https://github.com/signup) (recommended) or GitLab/Bitbucket
4. ✅ Your project files ready

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Prepare Your Project

1. **Ensure all files are in a folder**
   - All your project files should be in one directory
   - Make sure `vercel.json` is in the root

2. **Check the structure:**
   ```
   your-project/
   ├── App.tsx
   ├── components/
   ├── styles/
   ├── vercel.json
   ├── .gitignore
   └── README.md
   ```

### Step 2: Push to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Project Hub"
   ```

2. **Create a new repository on GitHub:**
   - Go to [GitHub](https://github.com/new)
   - Name it (e.g., "project-hub")
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/project-hub.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy on Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Log in or sign up
   - Click "Add New..." → "Project"

2. **Import your GitHub repository:**
   - Click "Import Git Repository"
   - Authorize Vercel to access GitHub (if first time)
   - Select your repository (e.g., "project-hub")
   - Click "Import"

3. **Configure the project:**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** ./ (leave as default)
   - **Build Command:** `npm run build` (should auto-fill)
   - **Output Directory:** `dist` (should auto-fill)
   - **Install Command:** `npm install` (should auto-fill)

4. **Click "Deploy"**
   - Vercel will now build and deploy your app
   - Wait 2-3 minutes for the build to complete
   - You'll see a success screen with your live URL!

### Step 4: Access Your App

Your app will be available at:
- Production URL: `https://your-project-name.vercel.app`
- Custom domain (optional): You can add your own domain in settings

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

Navigate to your project directory and run:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (for first deploy)
- What's your project's name? **project-hub** (or your preferred name)
- In which directory is your code located? **./** (press Enter)
- Want to override the settings? **N**

### Step 4: Deploy to Production

After the initial deploy, run:

```bash
vercel --prod
```

Your app is now live!

## Configuration Details

### vercel.json Explained

```json
{
  "buildCommand": "npm run build",      // Command to build the app
  "outputDirectory": "dist",            // Where build files are output
  "devCommand": "npm run dev",          // Development server command
  "installCommand": "npm install",      // Install dependencies command
  "framework": "vite",                  // Framework detection
  "rewrites": [                         // SPA routing support
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

The `rewrites` section ensures that all routes work correctly in your single-page application.

## Environment Variables (Optional)

If you need environment variables:

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Environment Variables"
   - Add variables (e.g., API keys)

2. **Via CLI:**
   ```bash
   vercel env add VARIABLE_NAME
   ```

**Note:** This app currently doesn't require any environment variables.

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `myapp.com`)

### Step 2: Configure DNS

Add these records to your domain's DNS settings:

**For root domain (myapp.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain (www.myapp.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait 24-48 hours for DNS propagation.

## Automatic Deployments

Vercel automatically deploys when you push to your GitHub repository:

- **Push to `main` branch** → Automatic production deploy
- **Push to other branches** → Preview deployments
- **Pull requests** → Automatic preview URLs

## Update Your App

### Method 1: Via Git

```bash
# Make your changes
git add .
git commit -m "Update feature X"
git push origin main
```

Vercel will automatically deploy the changes!

### Method 2: Via Vercel CLI

```bash
vercel --prod
```

## Project URLs

After deployment, you'll have:

1. **Production URL:**
   - `https://your-project-name.vercel.app`
   - This is your main live site

2. **Preview URLs:** (for branches and PRs)
   - `https://your-project-name-git-branch-name.vercel.app`

3. **Deployment URLs:** (unique for each deploy)
   - `https://your-project-name-hash123.vercel.app`

## Build Settings

### Vercel Auto-Detects:

- ✅ Framework: Vite
- ✅ Node Version: Latest LTS (20.x)
- ✅ Package Manager: npm
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

### If You Need to Override:

Go to Project Settings → General → Build & Development Settings

## Troubleshooting

### Build Fails

**Issue:** Build fails with dependency errors

**Solution:**
1. Make sure `package.json` has all dependencies
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` locally first
4. Test with `npm run build` locally
5. Push changes to GitHub

### App Shows 404

**Issue:** Routes show 404 error

**Solution:**
- Ensure `vercel.json` has the rewrites configuration
- Make sure it's in the root directory

### Blank Page

**Issue:** Deployment succeeds but page is blank

**Solution:**
1. Check browser console for errors (F12)
2. Verify the build output in Vercel logs
3. Make sure `index.html` is being served
4. Check if there are any import path issues

### Out of Memory

**Issue:** Build fails with "JavaScript heap out of memory"

**Solution:**
Add to `vercel.json`:
```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max_old_space_size=4096"
    }
  }
}
```

## Performance Optimization

### Enable Compression

Vercel automatically enables gzip/brotli compression.

### Caching

Vercel automatically caches static assets with optimal headers.

### Analytics (Optional)

Enable Vercel Analytics:
1. Go to project dashboard
2. Click "Analytics" tab
3. Click "Enable"
4. Free tier: 100k events/month

### Speed Insights (Optional)

Enable Web Vitals monitoring:
1. Go to project dashboard
2. Click "Speed Insights" tab
3. Click "Enable"

## Monitoring Your App

### View Deployments

```bash
vercel list
```

### View Logs

```bash
vercel logs [deployment-url]
```

### View in Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. View:
   - Deployments history
   - Analytics
   - Build logs
   - Function logs

## Rollback to Previous Version

### Via Dashboard:

1. Go to "Deployments" tab
2. Find the deployment you want to restore
3. Click "•••" → "Promote to Production"

### Via CLI:

```bash
vercel rollback [deployment-url]
```

## Free Tier Limits

Vercel's free tier includes:

- ✅ Unlimited deployments
- ✅ Unlimited bandwidth
- ✅ 100 GB-hours of build time/month
- ✅ HTTPS/SSL included
- ✅ DDoS protection
- ✅ CDN (global edge network)
- ✅ 6,000 build minutes/month
- ✅ 100 GB bandwidth/month

**More than enough for this app!**

## Best Practices

### 1. Use Git Branches

```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
```

This creates preview deployments without affecting production.

### 2. Test Before Merging

- Check the preview URL Vercel creates
- Test all functionality
- Then merge to main

### 3. Use Meaningful Commit Messages

```bash
git commit -m "Fix: Date validation in Analysis tab"
git commit -m "Feature: Add export to Excel functionality"
git commit -m "Update: Improve dark mode colors"
```

This helps track what changed in each deployment.

### 4. Keep Dependencies Updated

```bash
npm outdated          # Check for updates
npm update           # Update minor versions
npm install pkg@latest  # Update specific package
```

## Quick Command Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel list

# View logs
vercel logs

# Remove deployment
vercel remove [deployment-name]

# View project info
vercel inspect

# Add domain
vercel domains add your-domain.com

# Add environment variable
vercel env add VARIABLE_NAME

# Pull environment variables
vercel env pull
```

## Integration with GitHub

### Automatic Preview Comments

Vercel automatically posts preview URLs as comments on PRs:

1. Create a PR on GitHub
2. Vercel builds and deploys preview
3. Vercel bot comments with preview URL
4. Click to test changes
5. Merge when ready

### Branch Deployments

Every branch gets its own URL:
- `main` → Production
- `develop` → Preview
- `feature/x` → Preview

## Security

### HTTPS

- ✅ Automatic HTTPS for all deployments
- ✅ SSL certificates auto-renewed
- ✅ HTTP automatically redirects to HTTPS

### Headers

Vercel sets secure headers automatically:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### DDoS Protection

- ✅ Built-in DDoS mitigation
- ✅ Rate limiting
- ✅ Edge network protection

## Support Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord:** [vercel.com/discord](https://vercel.com/discord)
- **GitHub Discussions:** Your repository discussions
- **Stack Overflow:** Tag `vercel`

## Checklist for First Deployment

- [ ] All code is committed to Git
- [ ] `vercel.json` is in root directory
- [ ] `.gitignore` is configured
- [ ] Code builds successfully locally (`npm run build`)
- [ ] Repository is pushed to GitHub
- [ ] Vercel account is created
- [ ] GitHub is connected to Vercel
- [ ] Project is imported to Vercel
- [ ] Build settings are configured
- [ ] Deployment is successful
- [ ] Production URL is accessible
- [ ] All features work on live site
- [ ] Dark mode toggle works
- [ ] Excel import works
- [ ] Export functions work
- [ ] Data persists in localStorage

## Post-Deployment

### Share Your App

Your app is now live! Share the URL:
- `https://your-project-name.vercel.app`

### Next Steps

1. ✅ Test all features on live site
2. ✅ Add custom domain (optional)
3. ✅ Enable analytics (optional)
4. ✅ Set up automatic backups
5. ✅ Monitor performance

---

## Common Issues & Solutions

### "Failed to compile"

**Cause:** TypeScript or syntax errors

**Solution:**
1. Run `npm run build` locally
2. Fix any errors shown
3. Commit and push

### "Module not found"

**Cause:** Missing dependency in package.json

**Solution:**
```bash
npm install <missing-package>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### "Build exceeded maximum duration"

**Cause:** Build takes too long

**Solution:**
- Check for infinite loops in build scripts
- Optimize large dependencies
- Contact Vercel support for increased limits

## Success! 🎉

Your Project Hub is now live on Vercel with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Instant deployments
- ✅ Automatic backups (via Git)
- ✅ Zero downtime updates
- ✅ Professional hosting

**Enjoy your deployed app!**

---

**Last Updated:** December 2024  
**Deployment Platform:** Vercel  
**Framework:** React + Vite + TypeScript
