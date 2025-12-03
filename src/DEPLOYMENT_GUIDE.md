# Deployment Guide - Project Hub

This guide will help you download and run the Project Hub application as a standalone web application without needing to run npm or host a local server.

## Quick Start (No Technical Knowledge Required)

### Step 1: Build the Application

1. Open your terminal/command prompt
2. Navigate to the project folder
3. Run these commands once:
   ```bash
   npm install
   npm run build
   ```

### Step 2: Run the Application

After building, you have **3 easy options**:

#### Option A: Double-Click to Open (Simplest!)
1. Go to the `dist` folder
2. Double-click `index.html`
3. The app opens in your default browser
4. ✅ You're done! No server needed!

#### Option B: Use a Simple Server
1. Install `serve` (one-time only):
   ```bash
   npm install -g serve
   ```
2. Run from the project folder:
   ```bash
   serve dist
   ```
3. Open the URL shown (usually `http://localhost:3000`)

#### Option C: Deploy Online (Share with Others)
Upload the `dist` folder to any of these free services:
- **Netlify**: Drag & drop the `dist` folder at netlify.com/drop
- **Vercel**: Connect your repository at vercel.com
- **GitHub Pages**: Follow GitHub's static site hosting guide
- **Firebase Hosting**: Use Firebase CLI
- **Any Web Host**: Upload `dist` folder contents via FTP

## Understanding the Build

### What Happens When You Build?
```bash
npm run build
```

This command:
- ✅ Compiles all TypeScript code to JavaScript
- ✅ Bundles all files together
- ✅ Optimizes for production
- ✅ Creates a `dist` folder with your app
- ✅ Makes it ready to run anywhere!

### What's in the `dist` Folder?
```
dist/
  ├── index.html          (Main HTML file - open this!)
  ├── assets/
  │   ├── index-[hash].js   (Your app code)
  │   ├── index-[hash].css  (Styles)
  │   └── ...other files
  └── ...
```

## Sharing Your Application

### For Personal Use
- Just open `dist/index.html` in your browser
- Bookmark it for quick access
- Works offline once loaded!

### For Team Use
Choose one of these methods:

1. **Network Share**:
   - Copy `dist` folder to a shared network drive
   - Everyone opens `index.html` from the share
   - Each person's data stays in their browser

2. **Online Hosting** (Recommended):
   - Deploy to Netlify/Vercel (free!)
   - Share the URL with your team
   - Everyone accesses the same app
   - Data still stored locally in each browser

3. **Intranet Server**:
   - Upload `dist` folder to your company's web server
   - Access via company network
   - Works like any internal web app

## Data Persistence

### Important: Data is Local!
- All data is stored in **each user's browser**
- Data does **NOT sync** between users
- Each person has their own data

### Backup & Share Data
Users can:
1. Go to **Settings → Export All Data**
2. Download JSON backup file
3. Share file with others
4. Others use **Settings → Import Data** to load it

## Troubleshooting

### The app doesn't load when I double-click index.html
**Solution**: Use Option B (simple server) instead
```bash
npm install -g serve
serve dist
```

### I see a blank page
**Check**: Look at browser console (F12) for errors
**Solution**: Make sure you ran `npm run build` successfully

### Icons or images don't load
**Check**: Are you opening from the `dist` folder?
**Solution**: Always open `dist/index.html`, not the source files

### Changes I made aren't showing
**Solution**: Rebuild the application
```bash
npm run build
```
Then refresh your browser (Ctrl+F5 or Cmd+Shift+R)

## Advanced: Custom Domain

If you want a custom URL like `projects.yourcompany.com`:

1. **Deploy to a service** (Netlify/Vercel/etc.)
2. **Get your deployment URL**
3. **Configure your domain**:
   - Add a CNAME record pointing to the deployment
   - Wait for DNS propagation (up to 48 hours)
   - Access via your custom domain!

## File Structure Explanation

```
project-hub/
├── dist/                    ← Built application (THIS IS WHAT YOU NEED!)
├── src/                     ← Source code (for development)
├── components/              ← React components (for development)
├── public/                  ← Static assets
├── node_modules/            ← Dependencies (don't copy this)
├── package.json             ← Project configuration
├── vite.config.ts          ← Build configuration
└── README.md                ← Documentation
```

**To share the app**: Just share the `dist` folder!

## Security Notes

- ✅ No backend server means no server vulnerabilities
- ✅ All data stays in user's browser
- ✅ No data sent to external servers
- ✅ Works completely offline after first load
- ⚠️ Remember: Each user's data is separate
- ⚠️ Clearing browser data = losing app data
- ⚠️ Always export backups regularly!

## Performance Tips

### For Best Performance:
1. Use **Chrome** or **Edge** (best compatibility)
2. Enable browser **caching**
3. Don't clear browser data (or you'll lose your data!)
4. Export data regularly as backup

### For Multiple Devices:
- Export data from Device A
- Import data to Device B
- Repeat when needed
- Consider using online hosting for easier access

## Updates & Maintenance

### To Update the Application:
1. Make changes to source code
2. Rebuild:
   ```bash
   npm run build
   ```
3. Replace old `dist` folder with new one
4. Users refresh their browsers

### Version Control:
- Keep backup of each `dist` folder version
- Name them: `dist-v1.0`, `dist-v1.1`, etc.
- Easy rollback if needed

## Support

### Common Issues:
| Problem | Solution |
|---------|----------|
| Won't open | Use simple server (Option B) |
| Blank page | Check browser console, rebuild |
| Lost data | Import from backup JSON file |
| Slow performance | Clear browser cache, use Chrome |
| Can't export | Check browser download permissions |

### Getting Help:
1. Check browser console (F12) for errors
2. Try in different browser
3. Rebuild the application
4. Check README.md for features info

## Summary

**To deploy Project Hub:**
1. Run `npm install` (first time only)
2. Run `npm run build`
3. Open `dist/index.html` or use `serve dist`
4. ✅ Done!

**To share with team:**
- Upload `dist` folder to Netlify/Vercel/web host
- Share the URL
- Everyone can access it!

**Remember:**
- Each user's data is separate
- Export backups regularly
- Browser storage only!

---

**Need a truly shared database?** This app would need backend modifications with a database server. Current version is designed for single-user or distributed team use with manual data sharing via export/import.
