#!/usr/bin/env bash
# ==============================================================================
# RaiseMark Website — Publish to Public & Production Script
# Promotes approved changes from staging -> public -> main (raisemarkai.com)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "========================================================"
echo "🚀 RaiseMark Production Deployment Pipeline"
echo "========================================================"

# 1. Check working directory status
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Working directory has uncommitted changes."
    echo "Please commit or stash your changes on staging before publishing to production."
    git status -s
    exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "Switching to 'staging' branch..."
    git checkout staging
fi

echo "Current commit on staging: $(git rev-parse --short HEAD) - $(git log -1 --pretty=%B | head -n 1)"

# 2. Run Pre-flight Checks (Navigation consistency & CNAME check)
echo "Running pre-flight checks..."

if [ ! -f "CNAME" ] || [ "$(cat CNAME | tr -d '[:space:]')" != "raisemarkai.com" ]; then
    echo "❌ Error: CNAME file is missing or invalid! Production must point to raisemarkai.com."
    exit 1
fi

# Check navigation bar consistency across main pages
NAV_PAGES=("index.html" "about.html" "team.html" "method.html" "ai-360-review.html" "ai-policy-tracker.html" "policy-check-up.html" "articles.html" "contact.html")
echo "Verifying navigation blocks across core pages..."
for p in "${NAV_PAGES[@]}"; do
    if [ -f "$p" ]; then
        if ! grep -q '<ul class="nav-links"' "$p"; then
            echo "❌ Warning: Navigation list <ul class=\"nav-links\" missing in $p"
        fi
    fi
done
echo "✓ Pre-flight checks passed."

# 3. Promote staging to public branch
echo "Step 1/3: Merging 'staging' into 'public'..."
git checkout public
git pull origin public --quiet || true
git merge staging -m "Release to public: $(date +'%Y-%m-%d %H:%M:%S')"
echo "Pushing 'public' branch to origin..."
git push origin public

# 4. Promote public branch to main (production)
echo "Step 2/3: Merging 'public' into 'main'..."
git checkout main
git pull origin main --quiet || true
git merge public -m "Deploy to production: $(date +'%Y-%m-%d %H:%M:%S')"
echo "Pushing 'main' branch to origin (triggers raisemarkai.com GitHub Pages deployment)..."
git push origin main

# 5. Return to staging branch
echo "Step 3/3: Returning to 'staging' working branch..."
git checkout staging

echo "========================================================"
echo "🎉 SUCCESS: Changes pushed to PUBLIC and deployed to MAIN!"
echo "🌐 Production Site: https://raisemarkai.com"
echo "⏳ GitHub Pages is deploying now (takes ~1-2 minutes to be live)."
echo "========================================================"
