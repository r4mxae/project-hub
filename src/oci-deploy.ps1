# Oracle Cloud Infrastructure Deployment Script (PowerShell)
# For Project Hub - Static Website Deployment

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting OCI Deployment Process..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$BUCKET_NAME = "project-hub"
$NAMESPACE = ""  # Will be filled after OCI setup
$REGION = ""     # e.g., us-ashburn-1, us-phoenix-1

# Check if OCI CLI is installed
try {
    $ociVersion = oci --version
    Write-Host "✓ OCI CLI found: $ociVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ OCI CLI is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install OCI CLI first:"
    Write-Host "  Windows: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    Write-Host ""
    exit 1
}

# Check if OCI is configured
$ociConfigPath = "$env:USERPROFILE\.oci\config"
if (-not (Test-Path $ociConfigPath)) {
    Write-Host "❌ OCI CLI is not configured" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run: oci setup config"
    Write-Host ""
    exit 1
}

Write-Host "✓ OCI CLI configured" -ForegroundColor Green
Write-Host ""

# Step 1: Build the application
Write-Host "📦 Building application..." -ForegroundColor Blue
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed - dist/ directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Upload to OCI (if configured)
if ($NAMESPACE -and $REGION) {
    Write-Host "☁️  Uploading to OCI Object Storage..." -ForegroundColor Blue
    
    # Upload all files from dist/ to bucket
    oci os object bulk-upload `
        --bucket-name $BUCKET_NAME `
        --src-dir ./dist `
        --overwrite `
        --content-type-detection `
        --namespace $NAMESPACE `
        --region $REGION
    
    Write-Host ""
    Write-Host "✓ Upload completed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app should be available at:"
    Write-Host "https://objectstorage.$REGION.oraclecloud.com/n/$NAMESPACE/b/$BUCKET_NAME/o/index.html"
    Write-Host ""
} else {
    Write-Host "⚠️  NAMESPACE and REGION not configured in this script" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual upload instructions:"
    Write-Host "1. Go to OCI Console → Object Storage → Buckets"
    Write-Host "2. Select your bucket: $BUCKET_NAME"
    Write-Host "3. Click 'Upload'"
    Write-Host "4. Upload all files from the 'dist/' directory"
    Write-Host ""
    Write-Host "OR configure this script with your NAMESPACE and REGION"
    Write-Host ""
}

Write-Host "📁 Build files are ready in: ./dist/" -ForegroundColor Cyan
Write-Host ""
