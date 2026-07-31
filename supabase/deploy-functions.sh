#!/usr/bin/env bash
# Deploy all Supabase Edge Functions (macOS / Linux / Git Bash).
#
# One-time prerequisite (opens a browser to authorize):
#   npx supabase login
#
# Then run from the project root:
#   bash supabase/deploy-functions.sh
set -e

REF="lvglryvlvfixwueujbxr"
FUNCTIONS=(
  send-contact
  send-otp
  submit-project-request
  submit-blog
  upload-blog-image
  submit-comment
  verify-otp
  notify-blog-status
)

for fn in "${FUNCTIONS[@]}"; do
  echo ""
  echo "=== Deploying $fn ==="
  npx supabase functions deploy "$fn" --no-verify-jwt --project-ref "$REF"
done

echo ""
echo "All functions deployed."
