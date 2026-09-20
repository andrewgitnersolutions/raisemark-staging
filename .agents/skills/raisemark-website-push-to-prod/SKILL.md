---
name: raisemark-website-push-to-prod
description: >-
  Deploys approved RaiseMark website changes from the staging branch to the public branch and main production branch (raisemarkai.com).
  Use this skill whenever the user invokes /raisemark-website-push-to-prod, says "push to prod", "deploy to public", "push staging to public",
  or asks to publish the approved website changes to the live internet.
---

# RaiseMark Website — Push to Production Action

This action promotes approved website changes through the two-tier release pipeline:
`staging` &rarr; `public` &rarr; `main` &rarr; `https://raisemarkai.com`.

## When to Use
Trigger this skill whenever:
- The user types `/raisemark-website-push-to-prod`
- The user asks to "push to prod", "deploy to public", "publish website", or "push staging to public"
- The RaiseMark partners have given sign-off in the Partner Review Notes Google Doc

## Execution Runbook

1. **Working Tree Check**:
   Ensure all changes are saved and committed to `staging`:
   ```bash
   git status
   ```
   If uncommitted changes exist that the user wants published, stage and commit them:
   ```bash
   git add -A
   git commit -m "Partner approved changes ready for release"
   ```

2. **Execute Promotion Script**:
   Run the verified promotion script:
   ```bash
   ./scripts/publish-to-public.sh
   ```
   This script automatically:
   - Verifies `CNAME` is intact (`raisemarkai.com`)
   - Verifies navigation bar integrity across all core site pages
   - Merges `staging` into `public` and pushes to `origin/public`
   - Merges `public` into `main` and pushes to `origin/main`
   - Switches the local working directory back to `staging`

3. **Verify Deployment**:
   Check that GitHub Pages has registered the build:
   ```bash
   gh api repos/andrewgitnersolutions/PaiR/pages/builds/latest
   ```

4. **Confirm to User**:
   Provide the user with:
   - The commit hash deployed
   - The live production URL: [raisemarkai.com](https://raisemarkai.com)
   - A reminder to record the deployment in the Partner Review Notes Google Doc
