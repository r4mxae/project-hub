# Vercel Build Troubleshooting Guide 🔧

## Error: "No Output Directory named 'dist' found"

This error means the build process completed but didn't create the `dist` folder. Here's how to fix it:

---

## ✅ Pre-Deployment Checklist

### 1. Ensure package.json Exists

**Issue:** You may still have `package.json.example` instead of `package.json`

**Fix:**
```bash
# Rename the file
mv package.json.example package.json

# Verify it exists
ls -la | grep package.json
```

### 2. Verify Build Works Locally

**Test the build before deploying:**

```bash
# Install dependencies
npm install

# Run the build
npm run build

# Check if dist folder was created
ls -la dist/
```

**Expected output:**
```
dist/
├── index.html
└── assets/
    ├── index-[hash].css
    ├── index-[hash].js
    └── [other files]
```

If the build fails locally, **fix the errors first** before deploying to Vercel.

---

## 🐛 Common Build Issues

### Issue 1: TypeScript Errors

**Symptoms:**
```
error TS2307: Cannot find module...
error TS2345: Argument of type...
```

**Fix:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix all reported errors
# Then try building again
npm run build
```

### Issue 2: Missing Dependencies

**Symptoms:**
```
Cannot find module 'react'
Cannot find module 'xlsx'
```

**Fix:**
```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try building again
npm run build
```

### Issue 3: Import Path Errors

**Symptoms:**
```
Failed to resolve import
Module not found
```

**Fix:**
Check all imports in your files:
```tsx
// ✅ Correct
import { Button } from './components/ui/button'
import App from './App'

// ❌ Wrong
import { Button } from '/components/ui/button'  // No leading slash
import App from '/App'  // No leading slash
```

### Issue 4: Missing main.tsx or index.html

**Symptoms:**
```
Could not resolve entry module
```

**Fix:**
Ensure these files exist in the root:
- `index.html` (with `<script type="module" src="/main.tsx"></script>`)
- `main.tsx` (imports App and renders to root)

---

## 🔍 Vercel-Specific Issues

### Issue 1: Wrong Build Settings

**In Vercel Dashboard:**

1. Go to your project
2. Settings → General → Build & Development Settings
3. Ensure these settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Root Directory:** `./` (leave empty or set to root)

### Issue 2: Node Version Mismatch

**Symptoms:**
```
Node version mismatch
Unsupported engine
```

**Fix:**

Add to `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

Or create `.nvmrc` in project root:
```
18
```

### Issue 3: Build Command Not Found

**Symptoms:**
```
npm run build: command not found
```

**Fix:**

Check `package.json` has these scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 🛠️ Step-by-Step Debug Process

### Step 1: Clean Local Build

```bash
# Remove build artifacts
rm -rf dist node_modules package-lock.json

# Fresh install
npm install

# Test build
npm run build
```

### Step 2: Check Build Output

```bash
# After successful build, verify dist exists
ls -la dist/

# You should see:
# dist/index.html
# dist/assets/
```

### Step 3: Test Production Build Locally

```bash
# Preview the production build
npm run preview

# Visit http://localhost:4173
# App should work perfectly
```

### Step 4: Commit and Push

```bash
# Only proceed if local build works!
git add .
git commit -m "Fix build configuration"
git push origin main
```

### Step 5: Check Vercel Build Logs

In Vercel dashboard:
1. Go to Deployments
2. Click on the failed deployment
3. View the build logs
4. Look for the actual error (usually near the end)

---

## 📋 Verification Checklist

Before deploying, ensure:

- [ ] `package.json` exists (not `package.json.example`)
- [ ] `npm install` completes without errors
- [ ] `npm run build` creates `dist/` folder
- [ ] `npm run build` completes without TypeScript errors
- [ ] `dist/index.html` exists after build
- [ ] `dist/assets/` folder has JS and CSS files
- [ ] `npm run preview` works and app loads
- [ ] All files are committed to Git
- [ ] `vercel.json` exists in root
- [ ] `vite.config.ts` exists in root

---

## 🔧 Alternative: Manual Build Settings in Vercel

If auto-detection fails, manually configure in Vercel Dashboard:

**Settings → General → Build & Development Settings**

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
Root Directory: (leave empty)
Node.js Version: 18.x
```

**Save and redeploy.**

---

## 📊 Expected Build Process

When Vercel builds your app:

```
1. Install dependencies
   → npm install

2. Run TypeScript check
   → tsc (type checking)

3. Run Vite build
   → vite build
   → Creates dist/ folder
   → Bundles all code
   → Optimizes assets

4. Output to dist/
   ✅ dist/index.html
   ✅ dist/assets/...

5. Deploy dist/ contents
   → Your app is live!
```

If any step fails, the build stops and `dist/` won't be created.

---

## 🚨 Emergency: Build Still Fails?

### Option 1: Check Build Logs in Detail

```bash
# Run build with verbose output
npm run build -- --debug

# Check for hidden errors
```

### Option 2: Simplify Build

Temporarily remove optimization:

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Remove all other build options temporarily
  },
})
```

Try building again:
```bash
npm run build
```

If this works, gradually add back the optimizations.

### Option 3: Use Default Vite Config

Temporarily rename `vite.config.ts` to `vite.config.ts.backup`

Try building with default Vite settings:
```bash
npm run build
```

If this works, there's an issue in your vite.config.ts.

---

## 💡 Pro Tips

### 1. Always Test Locally First

```bash
# Golden rule: If it doesn't work locally, it won't work on Vercel
npm run build && npm run preview
```

### 2. Check TypeScript First

```bash
# Before every deployment
npx tsc --noEmit

# Fix all errors before building
```

### 3. Keep Build Logs

Save Vercel build logs when errors occur:
- They contain the exact error message
- Share them if seeking help

### 4. Incremental Testing

If you're unsure what broke the build:
```bash
# Test after each change
npm run build

# If it fails, you know what change caused it
```

---

## 📞 Still Stuck?

### Check These Files:

1. **package.json** - Ensure it exists and has correct scripts
2. **vite.config.ts** - Ensure it's valid TypeScript
3. **tsconfig.json** - Ensure TypeScript config is correct
4. **index.html** - Ensure it exists in root and references main.tsx
5. **main.tsx** - Ensure it exists and imports App correctly

### Common File Issues:

```bash
# Verify these files exist
ls -la index.html
ls -la main.tsx
ls -la App.tsx
ls -la vite.config.ts
ls -la tsconfig.json
ls -la package.json  # NOT package.json.example
```

---

## ✅ Success Indicators

You'll know everything works when:

1. **Local build succeeds:**
   ```bash
   npm run build
   ✓ build complete
   dist/index.html created
   ```

2. **Preview works:**
   ```bash
   npm run preview
   # App loads at localhost:4173
   ```

3. **Vercel build succeeds:**
   ```
   Building...
   ✓ Build Completed
   Deploying...
   ✓ Deployment Complete
   ```

4. **Live app works:**
   - Visit your Vercel URL
   - App loads properly
   - All features work

---

## 🎯 Quick Fix Summary

Most common issue is `package.json.example` not renamed:

```bash
# The fix:
mv package.json.example package.json
npm install
npm run build
git add .
git commit -m "Add package.json"
git push origin main

# Then redeploy on Vercel
```

---

**After fixing, always test locally before redeploying!**

```bash
npm run build && npm run preview
```

If it works locally, it will work on Vercel! 🎉
