#!/bin/bash

##############################################
# Oracle Cloud Infrastructure Deployment Script
# For Project Hub - Static Website Deployment
##############################################

set -e  # Exit on error

echo "🚀 Starting OCI Deployment Process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="project-hub"
NAMESPACE=""  # Will be filled after OCI setup
REGION=""     # e.g., us-ashburn-1, us-phoenix-1

# Check if OCI CLI is installed
if ! command -v oci &> /dev/null
then
    echo -e "${RED}❌ OCI CLI is not installed${NC}"
    echo ""
    echo "Please install OCI CLI first:"
    echo "  macOS/Linux: bash -c \"\$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)\""
    echo "  Windows: See https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} OCI CLI found"

# Check if OCI is configured
if [ ! -f ~/.oci/config ]; then
    echo -e "${RED}❌ OCI CLI is not configured${NC}"
    echo ""
    echo "Please run: oci setup config"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} OCI CLI configured"
echo ""

# Step 1: Build the application
echo -e "${BLUE}📦 Building application...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist/ directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build completed successfully"
echo ""

# Step 2: Check if bucket exists (optional - requires NAMESPACE and REGION to be set)
if [ -n "$NAMESPACE" ] && [ -n "$REGION" ]; then
    echo -e "${BLUE}☁️  Uploading to OCI Object Storage...${NC}"
    
    # Upload all files from dist/ to bucket
    oci os object bulk-upload \
        --bucket-name "$BUCKET_NAME" \
        --src-dir ./dist \
        --overwrite \
        --content-type-detection \
        --namespace "$NAMESPACE" \
        --region "$REGION"
    
    echo ""
    echo -e "${GREEN}✓${NC} Upload completed successfully"
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo "Your app should be available at:"
    echo "https://objectstorage.$REGION.oraclecloud.com/n/$NAMESPACE/b/$BUCKET_NAME/o/index.html"
    echo ""
else
    echo -e "${YELLOW}⚠️  NAMESPACE and REGION not configured in this script${NC}"
    echo ""
    echo "Manual upload instructions:"
    echo "1. Go to OCI Console → Object Storage → Buckets"
    echo "2. Select your bucket: $BUCKET_NAME"
    echo "3. Click 'Upload'"
    echo "4. Upload all files from the 'dist/' directory"
    echo ""
    echo "OR configure this script with your NAMESPACE and REGION"
    echo ""
fi

echo "📁 Build files are ready in: ./dist/"
echo ""
