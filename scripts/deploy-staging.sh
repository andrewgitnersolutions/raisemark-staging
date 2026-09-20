#!/usr/bin/env bash
# ==============================================================================
# RaiseMark Website — Deploy Staging Script
# Deploys current staging branch to andrewgitnersolutions/raisemark-staging
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STAGING_REMOTE_URL="https://github.com/andrewgitnersolutions/raisemark-staging.git"
STAGING_PUBLIC_URL="https://andrewgitnersolutions.github.io/raisemark-staging/"

echo "--------------------------------------------------------"
echo "🚀 Deploying RaiseMark Staging Environment"
echo "--------------------------------------------------------"

# 1. Ensure staging git remote exists
if ! git remote get-url staging >/dev/null 2>&1; then
    echo "Adding git remote 'staging'..."
    git remote add staging "$STAGING_REMOTE_URL"
fi

# 2. Check current branch and git status
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "Current branch: $CURRENT_BRANCH"

# 3. Create temporary staging build directory
TMP_DIR="$(mktemp -d -t raisemark-staging-XXXXXX)"
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Packaging site files for staging..."
# Copy all tracked git files to TMP_DIR
git archive HEAD | tar -x -C "$TMP_DIR"

# Also copy any untracked or modified working files if present
# (so local in-progress edits can be tested immediately on staging)
rsync -av --exclude='.git' --exclude='.github' --exclude='CNAME' --exclude='node_modules' "$ROOT_DIR/" "$TMP_DIR/" >/dev/null 2>&1 || true

# 4. Apply staging-specific safety overrides
cd "$TMP_DIR"

# Ensure CNAME is removed so GitHub Pages uses github.io domain
rm -f CNAME

# Strictly block all search engine indexing on staging
cat << 'EOF' > robots.txt
User-agent: *
Disallow: /
EOF

# Inject noindex meta tag into all HTML files if not already present
for f in *.html; do
    if [ -f "$f" ] && ! grep -q 'name="robots"' "$f"; then
        sed -i '' 's|</head>|    <meta name="robots" content="noindex, nofollow">\
</head>|' "$f" 2>/dev/null || true
    fi
done

# 5. Initialize git in temporary directory and push to staging repo
git init -b main >/dev/null
git config user.name "Andrew Gitner (RaiseMark Staging Deployer)"
git config user.email "andrew@raisemarkai.com"
git add -A
COMMIT_HASH="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
git commit -m "Deploy staging preview (from $CURRENT_BRANCH @ $COMMIT_HASH) [skip ci]" >/dev/null

echo "Pushing build to raisemark-staging repository..."
git remote add origin "$STAGING_REMOTE_URL"
git push origin main --force --quiet

echo "--------------------------------------------------------"
echo "✅ Staging deployment complete!"
echo "🔗 Staging Preview Link: $STAGING_PUBLIC_URL"
echo "📝 Partner Review Doc:  https://docs.google.com/document/d/1wSIiooveooBB19nOV8PheYy88YgQ4S8x9sz9SBHQCm4/edit"
echo "--------------------------------------------------------"
