# Pre-Deployment Checklist ✈️

Run through this checklist before deploying to ensure a smooth deployment to Vercel.

## 📋 Essential Files Check

Verify these files exist in your project root:

- [ ] `vercel.json` - Vercel configuration
- [ ] `.gitignore` - Git ignore rules
- [ ] `package.json` - Project dependencies
- [ ] `vite.config.ts` or `vite.config.js` - Vite configuration
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `index.html` - Main HTML file
- [ ] `App.tsx` - Main application component

## 🔍 Code Quality Check

### 1. Build Test
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No missing dependencies warnings
- [ ] `dist` folder is created successfully

### 2. Preview Test
```bash
npm run preview
```
- [ ] App runs in preview mode
- [ ] All pages load correctly
- [ ] No console errors
- [ ] All features work

### 3. Feature Testing

**Dashboard:**
- [ ] Dashboard loads
- [ ] Notifications display
- [ ] Real-time stats show correctly

**Projects & Tasks:**
- [ ] Can create new project
- [ ] Can create new task
- [ ] Timer functionality works
- [ ] Can start/stop timer
- [ ] Work log saves correctly
- [ ] Can export work logs

**Procurement:**
- [ ] Can add procurement item manually
- [ ] Excel import modal opens
- [ ] Sample file uploads successfully
- [ ] Column mapping works
- [ ] Import completes without errors
- [ ] Date columns convert correctly

**Analysis:**
- [ ] Charts render correctly
- [ ] Statistics calculate accurately
- [ ] Export to PNG works
- [ ] Export to JPG works
- [ ] Export to PDF works
- [ ] No OKLCH errors in console

**Settings:**
- [ ] Can update user profile
- [ ] Can export all data
- [ ] Can import data
- [ ] Dark mode toggle works
- [ ] Wipe data confirmation works

**Other Tabs:**
- [ ] Completed tab loads
- [ ] Savings tab calculates correctly
- [ ] Upcoming tab works (test after 24th)
- [ ] Focal Points CRUD works
- [ ] Risks tab displays correctly

## 📦 Dependencies Check

```bash
npm outdated
```
- [ ] No critical outdated packages
- [ ] All dependencies are compatible
- [ ] No security vulnerabilities

```bash
npm audit
```
- [ ] No high or critical vulnerabilities
- [ ] If vulnerabilities exist, run: `npm audit fix`

## 🗂️ File Structure Check

Your project should look like this:

```
project-root/
├── App.tsx
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── .gitignore
├── README.md
├── VERCEL_DEPLOYMENT.md
├── DEPLOY_CHECKLIST.md
├── EXCEL_IMPORT_GUIDE.md
├── components/
│   ├── Dashboard.tsx
│   ├── Projects.tsx
│   ├── Tasks.tsx
│   ├── ProjectsAndTasks.tsx
│   ├── Procurement.tsx
│   ├── Analysis.tsx
│   ├── Settings.tsx
│   ├── Sidebar.tsx
│   ├── FocalPoints.tsx
│   ├── Risks.tsx
│   ├── Savings.tsx
│   ├── Completed.tsx
│   ├── Upcoming.tsx
│   └── ui/
│       └── (UI components)
├── styles/
│   └── globals.css
└── utils/
    └── darkMode.ts
```

- [ ] All component files are in `/components`
- [ ] All styles are in `/styles`
- [ ] All utility files are in `/utils`
- [ ] No unnecessary files in root

## 🔧 Configuration Verification

### vercel.json
Check your `vercel.json` contains:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
- [ ] File exists and is valid JSON
- [ ] All fields are correct

### .gitignore
Check `.gitignore` includes:
```
node_modules
dist
.vercel
.env*
*.local
```
- [ ] File exists
- [ ] Includes essential ignores

### package.json scripts
Check scripts section includes:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```
- [ ] Build script exists
- [ ] Dev script exists
- [ ] Preview script exists

## 🌐 Environment Check

### Node Version
```bash
node --version
```
- [ ] Node version >= 18.0.0

### NPM Version
```bash
npm --version
```
- [ ] NPM version >= 9.0.0

## 📝 Git Check

### Git Status
```bash
git status
```
- [ ] No uncommitted critical changes
- [ ] Working directory is clean or ready to commit

### Git Remote
```bash
git remote -v
```
- [ ] Remote repository is configured
- [ ] Remote URL is correct

### Test Push
```bash
git push --dry-run origin main
```
- [ ] Dry run succeeds
- [ ] No push errors

## 🔐 Security Check

- [ ] No API keys hardcoded in code
- [ ] No sensitive data in repository
- [ ] No personal information in sample data
- [ ] `.gitignore` excludes sensitive files
- [ ] Environment variables are properly handled

## 📊 Performance Check

### Bundle Size
After `npm run build`, check dist folder:
- [ ] Total size < 5MB (typical for this app: 1-2MB)
- [ ] Individual chunks are reasonably sized
- [ ] No suspiciously large files

### Lighthouse Check (Optional)
Run Lighthouse on preview build:
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 80

## 📱 Browser Testing

Test in development mode (`npm run dev`):

**Desktop:**
- [ ] Chrome/Edge - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work

**Mobile (Responsive):**
- [ ] Mobile Chrome - UI is responsive
- [ ] Mobile Safari - UI is responsive
- [ ] Tablet view - UI adapts correctly

## 💾 Data Persistence Check

1. Create test data (project, task, procurement item)
2. Refresh the page
3. Verify:
   - [ ] Data persists after refresh
   - [ ] Dark mode preference persists
   - [ ] User settings persist

4. Export data
   - [ ] Export file downloads
   - [ ] Export file is valid JSON

5. Import data
   - [ ] Import accepts valid JSON
   - [ ] Data restores correctly

## 🚨 Error Handling Check

- [ ] Invalid date inputs are handled gracefully
- [ ] Missing data doesn't crash the app
- [ ] Excel import errors show user-friendly messages
- [ ] Export failures show error toasts
- [ ] Network failures are handled (if applicable)

## 📚 Documentation Check

- [ ] README.md is complete and accurate
- [ ] VERCEL_DEPLOYMENT.md is included
- [ ] DEPLOY_CHECKLIST.md is included
- [ ] EXCEL_IMPORT_GUIDE.md is included
- [ ] All documentation is up to date

## ✅ Final Pre-Flight Check

Before you deploy:

1. **Clean Install Test:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```
   - [ ] Clean install succeeds
   - [ ] Build succeeds after clean install

2. **Fresh Build Test:**
   ```bash
   rm -rf dist
   npm run build
   npm run preview
   ```
   - [ ] Fresh build succeeds
   - [ ] Preview shows working app

3. **Git Commit:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```
   - [ ] All changes committed
   - [ ] Pushed to GitHub successfully

## 🎯 Deployment Decision

All checks passed?

- ✅ **YES** → Proceed to deployment! Use [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
- ❌ **NO** → Fix issues listed above before deploying

## 🐛 Common Issues & Fixes

### Issue: Build fails with TypeScript errors
**Fix:**
```bash
npm run build
# Fix all TypeScript errors shown
```

### Issue: Build fails with dependency errors
**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build succeeds but preview shows errors
**Fix:**
- Check browser console (F12)
- Fix any runtime errors
- Rebuild and test again

### Issue: Import paths are wrong
**Fix:**
- Ensure all imports use relative paths
- Check case sensitivity (React vs react)
- Verify file extensions

### Issue: CSS not loading
**Fix:**
- Verify `globals.css` is imported in main file
- Check Tailwind configuration
- Ensure PostCSS is configured

### Issue: Assets not loading
**Fix:**
- Move assets to `public` folder
- Use proper asset references
- Check build output for missing files

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Search for the error online
3. Review Vite documentation
4. Review Vercel documentation
5. Check React documentation

## ✨ Ready to Deploy!

Once all checks pass:

1. Follow [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
2. Deploy to Vercel
3. Test the live deployment
4. Share your live URL!

---

**Remember:** It's better to spend 10 minutes checking now than 1 hour debugging after deployment! 🚀

**Last Updated:** December 2024  
**Deployment Platform:** Vercel
