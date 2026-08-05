# Deploy all Supabase Edge Functions (Windows / PowerShell).
#
# One-time prerequisite (opens a browser to authorize):
#   npx supabase login
#
# Then run this from the project root:
#   ./supabase/deploy-functions.ps1

$ref = "lvglryvlvfixwueujbxr"
$functions = @(
  "send-contact",
  "send-otp",
  "submit-project-request",
  "submit-blog",
  "upload-blog-image",
  "submit-comment",
  "verify-otp",
  "notify-blog-status",
  "subscribe-blog",
  "notify-subscribers",
  "request-access",
  "decide-access",
  "get-download",
  "create-order"
)

foreach ($fn in $functions) {
  Write-Host "`n=== Deploying $fn ===" -ForegroundColor Cyan
  npx supabase functions deploy $fn --no-verify-jwt --project-ref $ref
}

Write-Host "`nAll functions deployed." -ForegroundColor Green
