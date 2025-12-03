# ☁️ Oracle Cloud Infrastructure (OCI) Deployment Guide

**Project:** Project Hub  
**Deployment Type:** Static Website (Object Storage)  
**Cost:** FREE (Always Free Tier)  
**Time to Deploy:** 20-30 minutes (first time)

---

## 🎯 **WHAT YOU'LL GET**

- ✅ **100% FREE hosting** (Oracle Always Free Tier)
- ✅ **Fast global access** via OCI's network
- ✅ **20GB storage** included free
- ✅ **50,000 API requests/month** free
- ✅ **No credit card required** for 30 days
- ✅ **HTTPS support** with SSL certificate
- ✅ **Custom domain** support (optional)

---

## 📋 **PREREQUISITES**

Before starting, you need:

- [ ] Computer with internet connection
- [ ] Oracle Cloud account (we'll create this)
- [ ] Your Project Hub code (already ready!)
- [ ] Node.js installed (for building locally)
- [ ] 30 minutes of time

**No credit card required for the first 30 days!**

---

## 🚀 **STEP-BY-STEP DEPLOYMENT**

### **PHASE 1: CREATE ORACLE CLOUD ACCOUNT** (10 minutes)

#### **Step 1.1: Sign Up for OCI Free Tier**

1. Go to: **https://www.oracle.com/cloud/free/**
2. Click **"Start for free"** button
3. Fill in the form:
   - **Country/Territory:** Your country
   - **First Name:** Your name
   - **Last Name:** Your last name
   - **Email:** Your email address
   - **Cloud Account Name:** `project-hub-[your-name]` (must be unique)
4. Click **"Verify my email"**
5. Check your email and click verification link
6. Complete the registration:
   - **Password:** Create a strong password
   - **Company Name:** Your company (or personal name)
   - **Cloud Account Name:** Confirm the name
7. Choose **"Free Tier"** account type
8. Agree to terms and click **"Start my free trial"**

**✅ You now have an OCI account!**

---

#### **Step 1.2: Initial Login**

1. You'll receive an email: "Get Started Now with Oracle Cloud"
2. Click the link in the email
3. You'll see the **OCI Console** (dashboard)
4. Take note of your:
   - **Tenancy Name:** (shown in top right)
   - **Region:** (shown in top right, e.g., "US East (Ashburn)")
   - **Username:** (your email)

**✅ You're logged into OCI!**

---

### **PHASE 2: CREATE OBJECT STORAGE BUCKET** (5 minutes)

#### **Step 2.1: Navigate to Object Storage**

1. In OCI Console, click **☰ (hamburger menu)** in top left
2. Navigate to: **Storage** → **Object Storage & Archive Storage** → **Buckets**
3. You'll see the "Buckets" page

---

#### **Step 2.2: Create a Bucket**

1. Click **"Create Bucket"** button
2. Fill in the form:
   - **Bucket Name:** `project-hub`
   - **Default Storage Tier:** `Standard` ✅
   - **Encryption:** `Encrypt using Oracle managed keys` ✅
   - **Emit Object Events:** Leave unchecked
   - **Enable Auto-Tiering:** Leave unchecked
3. Click **"Create"** button

**✅ Your bucket is created!**

---

#### **Step 2.3: Make Bucket Public**

1. Click on your **"project-hub"** bucket name
2. Click **"Edit Visibility"** button (under bucket details)
3. Select **"Public"** 
4. Click **"Save Changes"**
5. Confirm the warning by clicking **"OK"**

**✅ Your bucket is now publicly accessible!**

---

#### **Step 2.4: Get Bucket Information**

Copy these values (you'll need them later):

1. **Namespace:** Found at the top of the bucket details page
   - Example: `axabcd1234`
   - Copy this! Write it down! 📝

2. **Region Identifier:** Found in top right of console
   - Example: `us-ashburn-1` or `us-phoenix-1`
   - Copy this! Write it down! 📝

3. **Bucket Name:** `project-hub`

**📝 IMPORTANT: Save these three values!**

```
Namespace: ___________________
Region:    ___________________
Bucket:    project-hub
```

---

### **PHASE 3: BUILD YOUR APPLICATION** (2 minutes)

On your **local computer** (where you have Project Hub code):

#### **Step 3.1: Build the App**

```bash
# Navigate to your project folder
cd project-hub

# Install dependencies (if not already done)
npm install

# Build the production version
npm run build
```

**Expected output:**
```
vite v6.3.5 building for production...
✓ 2490 modules transformed.
✓ built in 8-10s

dist/index.html                    0.44 kB
dist/assets/index-*.css            4.72 kB
dist/assets/index-*.js           167.38 kB
dist/assets/chart-vendor-*.js    409.70 kB
dist/assets/xlsx-*.js            424.69 kB
... (more files)

✓ Build completed!
```

**✅ Check:** A `dist/` folder should now exist with all your files!

---

#### **Step 3.2: Verify Build**

```bash
# Check that dist/ folder exists
ls dist/

# Should show:
# index.html
# assets/
```

**✅ Your app is built and ready!**

---

### **PHASE 4: UPLOAD TO OCI** (10 minutes)

You have **two options**: Manual Upload (easier) or CLI Upload (faster for updates)

---

#### **OPTION A: Manual Upload via Web Console** ⭐ (RECOMMENDED for first time)

1. Go back to OCI Console → **Object Storage** → **Buckets** → **project-hub**
2. Click **"Upload"** button
3. In the upload dialog:
   - Click **"select files"**
   - Navigate to your `dist/` folder
   - Select **ALL files and folders** in dist/
   - Click **"Open"**
4. Click **"Upload"** button (bottom right)
5. Wait for upload to complete (1-3 minutes)
6. You should see all files listed in the bucket

**✅ Files uploaded to OCI!**

---

#### **OPTION B: Upload via OCI CLI** (For advanced users)

**Prerequisites:** Install OCI CLI first

**Install OCI CLI:**

**macOS/Linux:**
```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

**Windows:**
Download installer from: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm

**Configure OCI CLI:**
```bash
oci setup config
```

Follow the prompts and enter:
- **Location for config:** Press Enter (default)
- **User OCID:** Get from OCI Console → Profile → User Settings
- **Tenancy OCID:** Get from OCI Console → Profile → Tenancy
- **Region:** Your region (e.g., us-ashburn-1)
- **Generate RSA key pair:** Y
- **Key location:** Press Enter (default)

**Upload using CLI:**
```bash
# Edit oci-deploy.sh first (set NAMESPACE and REGION)
chmod +x oci-deploy.sh
./oci-deploy.sh

# OR manually:
oci os object bulk-upload \
  --bucket-name project-hub \
  --src-dir ./dist \
  --namespace YOUR_NAMESPACE \
  --region YOUR_REGION \
  --overwrite
```

**✅ Files uploaded via CLI!**

---

### **PHASE 5: CONFIGURE STATIC WEBSITE** (3 minutes)

#### **Step 5.1: Enable Static Website Hosting**

**IMPORTANT:** OCI Object Storage doesn't have built-in "static website hosting" like AWS S3. 
Instead, we'll use direct file access URLs.

Your app will be accessible at:
```
https://objectstorage.REGION.oraclecloud.com/n/NAMESPACE/b/project-hub/o/index.html
```

**Example:**
```
https://objectstorage.us-ashburn-1.oraclecloud.com/n/axabcd1234/b/project-hub/o/index.html
```

---

#### **Step 5.2: Set Up Routing for React Router**

Since this is a Single Page Application (SPA), we need special handling for routing.

**Two options:**

**Option A: Use Hash Router** (Simpler - Already works!)
- Your app uses React Router with regular routes
- OCI will serve index.html for direct access
- Navigation within app works perfectly
- **No additional setup needed!** ✅

**Option B: Use OCI API Gateway** (Advanced - for custom domains)
- Set up API Gateway to route all paths to index.html
- Required for custom domain with clean URLs
- See "Advanced Configuration" section below

---

#### **Step 5.3: Test Your Deployment**

1. Get your app URL:
   ```
   https://objectstorage.[YOUR_REGION].oraclecloud.com/n/[YOUR_NAMESPACE]/b/project-hub/o/index.html
   ```

2. Replace:
   - `[YOUR_REGION]` with your region (e.g., `us-ashburn-1`)
   - `[YOUR_NAMESPACE]` with your namespace (e.g., `axabcd1234`)

3. Open the URL in your browser

4. **Expected result:**
   - ✅ Your Project Hub app loads!
   - ✅ Dashboard shows correctly
   - ✅ All tabs work
   - ✅ Dark mode toggle works
   - ✅ Charts render
   - ✅ Excel import/export works

**🎉 YOUR APP IS LIVE ON ORACLE CLOUD!** 🎉

---

### **PHASE 6: GET A SHORTER URL** (Optional - 5 minutes)

Your default URL is long. Let's create a shorter access URL.

#### **Option A: Create a PAR (Pre-Authenticated Request)**

1. In OCI Console, go to your bucket → **project-hub**
2. Find **index.html** in the file list
3. Click the ⋮ (three dots) next to it
4. Select **"Create Pre-Authenticated Request"**
5. Configure:
   - **Name:** `project-hub-access`
   - **Pre-Authenticated Request Target:** `Object`
   - **Access Type:** `Permit reads on the object`
   - **Expiration:** Set to 1 year from now
6. Click **"Create"**
7. **IMPORTANT:** Copy the generated URL (you can't see it again!)
8. Save this URL - it's your new short access URL!

**✅ You now have a shorter, permanent URL!**

Example: `https://objectstorage.us-ashburn-1.oraclecloud.com/p/abc123.../n/namespace/b/project-hub/o/index.html`

---

#### **Option B: Use a Custom Domain** (Advanced)

See "Custom Domain Setup" section below.

---

## 🔄 **UPDATING YOUR APP**

When you make changes to your app:

### **Method 1: Manual Update**

```bash
# 1. Make your changes to the code
# 2. Build the new version
npm run build

# 3. Go to OCI Console → Object Storage → project-hub bucket
# 4. Delete old files (or skip to overwrite)
# 5. Upload new files from dist/ folder
# 6. Done! Changes are live immediately!
```

---

### **Method 2: CLI Update (Faster)**

```bash
# 1. Make your changes to the code
# 2. Run the deployment script
./oci-deploy.sh

# OR manually:
npm run build
oci os object bulk-upload \
  --bucket-name project-hub \
  --src-dir ./dist \
  --namespace YOUR_NAMESPACE \
  --region YOUR_REGION \
  --overwrite

# Done! Changes are live!
```

---

## 💰 **COST BREAKDOWN**

### **FREE TIER LIMITS** (Always Free - Forever!)

| Resource | Free Tier | Your Usage | Cost |
|----------|-----------|------------|------|
| **Storage** | 20 GB | ~5 MB | $0.00 |
| **API Requests** | 50,000/month | ~1,000/month | $0.00 |
| **Data Transfer** | 10 TB/month | ~1 GB/month | $0.00 |

**Total Monthly Cost: $0.00** ✅

---

### **IF YOU EXCEED FREE TIER** (Unlikely!)

| Resource | Cost |
|----------|------|
| Storage (over 20GB) | $0.0255/GB/month |
| API Requests (over 50k) | $0.004 per 1000 requests |
| Data Transfer Out (over 10TB) | $0.085/GB |

**Example:** 100GB storage + 100k requests + 50GB transfer = ~$9/month

**Your app uses ~5MB storage, so you'll stay FREE!** ✅

---

## 🔒 **SECURITY BEST PRACTICES**

### **1. Keep Bucket Public (Required for Website)**
- ✅ Your bucket must be public for website access
- ✅ Your app is static (no sensitive data in code)
- ✅ All data is client-side (localStorage)
- ⚠️ Never store API keys in your frontend code

---

### **2. Enable HTTPS (Automatic)**
- ✅ OCI URLs use HTTPS by default
- ✅ All traffic is encrypted
- ✅ No additional setup needed

---

### **3. Monitor Access (Optional)**
1. Go to OCI Console → **Observability & Management** → **Logging**
2. Create a log group for your bucket
3. Monitor access patterns
4. Set up alerts for unusual activity

---

## 🌐 **CUSTOM DOMAIN SETUP** (Optional - Advanced)

Want to use your own domain? (e.g., `project-hub.yourdomain.com`)

### **Prerequisites:**
- Own a domain name
- Access to domain DNS settings

---

### **Step 1: Create OCI DNS Zone**

1. OCI Console → **Networking** → **DNS Management** → **Zones**
2. Click **"Create Zone"**
3. Enter your domain: `yourdomain.com`
4. Click **"Create"**

---

### **Step 2: Get OCI Name Servers**

1. Click on your zone
2. Copy the 4 nameserver addresses
3. Go to your domain registrar (GoDaddy, Namecheap, etc.)
4. Update nameservers to OCI nameservers

---

### **Step 3: Create CNAME Record**

1. In your DNS zone, click **"Add Record"**
2. **Type:** `CNAME`
3. **Name:** `project-hub` (or `@` for root domain)
4. **Target:** Your OCI bucket URL
5. **TTL:** 300
6. Click **"Submit"**

---

### **Step 4: Wait for DNS Propagation**

- Takes 1-24 hours
- Check with: `nslookup project-hub.yourdomain.com`
- Once propagated, access your app at: `https://project-hub.yourdomain.com`

---

### **Step 5: Add SSL Certificate** (Optional)

1. OCI Console → **Networking** → **Certificates**
2. Upload your SSL certificate
3. Or use Let's Encrypt (free)
4. Configure API Gateway to use certificate
5. Access via: `https://project-hub.yourdomain.com`

---

## 📊 **MONITORING & ANALYTICS**

### **Option 1: OCI Monitoring (Free)**

1. Go to **Observability & Management** → **Monitoring**
2. View metrics:
   - Request count
   - Data transfer
   - Error rates
3. Set up alarms for issues

---

### **Option 2: Google Analytics (Free)**

Add to your app:

```typescript
// In index.html or App.tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

Rebuild and redeploy to track visitors!

---

## 🐛 **TROUBLESHOOTING**

### **Issue 1: App doesn't load (404 error)**

**Cause:** index.html not accessible

**Fix:**
1. Check bucket visibility is "Public"
2. Verify index.html exists in bucket root
3. Check URL format:
   ```
   https://objectstorage.[REGION].oraclecloud.com/n/[NAMESPACE]/b/project-hub/o/index.html
   ```
4. Replace [REGION] and [NAMESPACE] with your actual values

---

### **Issue 2: Blank page after loading**

**Cause:** JavaScript files not loading

**Fix:**
1. Check browser console (F12) for errors
2. Verify all files in `assets/` folder uploaded
3. Check file permissions in bucket
4. Clear browser cache and try again

---

### **Issue 3: Routes don't work (404 on refresh)**

**Cause:** Direct URL access to routes not supported

**Fix:**
- Option A: Use hash router in React (already configured)
- Option B: Set up OCI API Gateway to route all requests to index.html
- Option C: Always access via main URL and navigate within app

---

### **Issue 4: Slow loading**

**Cause:** Files served from single region

**Fix:**
1. Enable OCI CDN:
   - Go to **Networking** → **Content Delivery Network**
   - Create distribution for your bucket
   - Update URL to CDN URL
2. Or use Cloudflare (free) as CDN in front of OCI

---

### **Issue 5: Upload fails**

**Cause:** File too large or permissions issue

**Fix:**
1. Check file sizes (OCI limit: 10GB per file)
2. Verify bucket permissions
3. Try uploading in smaller batches
4. Use OCI CLI instead of web console

---

## ✅ **VERIFICATION CHECKLIST**

After deployment, verify everything works:

- [ ] App loads at OCI URL
- [ ] Dashboard displays correctly
- [ ] All tabs are accessible (Projects, Procurement, etc.)
- [ ] Dark mode toggle works
- [ ] Charts render properly
- [ ] Excel import works
- [ ] Excel export works
- [ ] Data persists (localStorage)
- [ ] No console errors (F12)
- [ ] Mobile responsive (test on phone)
- [ ] Fast loading (< 3 seconds)

**If all checked: 🎉 PERFECT DEPLOYMENT!** 🎉

---

## 📚 **HELPFUL RESOURCES**

- **OCI Documentation:** https://docs.oracle.com/en-us/iaas/Content/Object/home.htm
- **OCI Free Tier:** https://www.oracle.com/cloud/free/
- **OCI CLI Guide:** https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm
- **OCI Support:** https://www.oracle.com/cloud/support.html

---

## 🎯 **QUICK REFERENCE**

### **Your App URLs:**

```
Development: http://localhost:5173
Production:  https://objectstorage.[REGION].oraclecloud.com/n/[NAMESPACE]/b/project-hub/o/index.html
```

### **Deployment Commands:**

```bash
# Build
npm run build

# Deploy (manual)
# Upload dist/ folder via OCI Console

# Deploy (CLI)
./oci-deploy.sh
```

### **Your OCI Details:**

```
Namespace: ___________________
Region:    ___________________
Bucket:    project-hub
URL:       ___________________
```

---

## 🚀 **NEXT STEPS**

After successful deployment:

1. ✅ Save your app URL somewhere safe
2. ✅ Bookmark the OCI Console
3. ✅ Share your app URL with others
4. ✅ Consider adding a custom domain
5. ✅ Set up monitoring/analytics
6. ✅ Plan your next feature updates!

---

**🎉 CONGRATULATIONS!** 🎉

Your **Project Hub** is now live on **Oracle Cloud Infrastructure** for **FREE**!

You've successfully:
- ✅ Created an OCI account
- ✅ Set up Object Storage bucket
- ✅ Built and deployed your app
- ✅ Made it publicly accessible
- ✅ Saved money (100% free!)

**Enjoy your cloud-hosted application!** ☁️✨

---

**Project:** Project Hub  
**Developer:** r4mxae  
**Hosting:** Oracle Cloud Infrastructure (OCI)  
**Cost:** $0.00/month (Always Free Tier)  
**Status:** 🟢 DEPLOYED & LIVE!
