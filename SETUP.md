# Backend setup checklist

Everything the newer features need on the Supabase side, in one place.
The frontend deploys automatically on `git push`; these are the **one-time**
backend steps.

---

## 1. Run the SQL

Supabase → **SQL Editor** → paste & **Run**:

- **`supabase/setup-features.sql`** — sets up everything in one go:
  - Visitor analytics (`site_stats` + `increment_visits`)
  - Profile `quote`, `quote_author`, `summary` columns
  - Blog (`blogs` table + author fields + RLS)
  - Request-a-Project (`project_requests` + `email_otps`)

_All idempotent — safe to re-run._

Optional:
- **`supabase/seed-blog.sql`** — publishes a starter "Agentic AI" post.

> The base schema (`setup.sql`, `admin-policies.sql`, `storage.sql`) is already
> in place since the site works — you don't need to re-run those.

---

## 2. Deploy the Edge Functions

Each is a public endpoint, so **JWT verification must be OFF**.

**Dashboard method (recommended):** Edge Functions → *Deploy a new function → Via editor* → name it exactly as below → paste the file's contents → Deploy → in the function's settings turn **Verify JWT OFF**.

**CLI method:**
```bash
npx supabase functions deploy send-contact             --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
npx supabase functions deploy send-otp                 --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
npx supabase functions deploy submit-project-request   --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
npx supabase functions deploy submit-blog              --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
npx supabase functions deploy upload-blog-image        --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
npx supabase functions deploy submit-comment           --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
npx supabase functions deploy verify-otp               --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
npx supabase functions deploy notify-blog-status       --no-verify-jwt --project-ref lvglryvlvfixwueujbxr
```

| Function | Used by | File |
|---|---|---|
| `send-contact` | Contact "Say Hi" form | `supabase/functions/send-contact/index.ts` |
| `send-otp` | OTP for project + blog forms (shared) | `supabase/functions/send-otp/index.ts` |
| `submit-project-request` | Request-a-Project form | `supabase/functions/submit-project-request/index.ts` |
| `submit-blog` | Public blog submissions | `supabase/functions/submit-blog/index.ts` |
| `upload-blog-image` | Image uploads from the public blog editor | `supabase/functions/upload-blog-image/index.ts` |
| `submit-comment` | Blog post comments | `supabase/functions/submit-comment/index.ts` |
| `verify-otp` | Validate the OTP before blog submit | `supabase/functions/verify-otp/index.ts` |
| `notify-blog-status` | Email the author when you change status | `supabase/functions/notify-blog-status/index.ts` |

---

## 3. Secrets

Edge Functions → **Secrets** (or `supabase secrets set …`). Should already be set
(the contact form uses them):

- `BREVO_API_KEY` — Brevo → SMTP & API → API Keys
- `BREVO_SENDER_EMAIL` — a verified sender in Brevo
- `CONTACT_TO_EMAIL` — where enquiries/requests/notifications land
- _(optional)_ `BREVO_SENDER_NAME`, `OWNER_NAME`

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — don't add them.

---

## 4. Verify

- **Visits/live** — the badge shows a count on the home page.
- **Blog** — write a post in `/admin` → 📝 Blog → Publish → it appears at `/blog`.
- **Blog submission** — `/blog/write` → send code → enter it → submit → the draft
  shows in `/admin` → Blog.
- **Project request** — Contact → *Request a Project* → send code → submit → you
  get the email and a row in `project_requests`.

If a form returns **401**, that function still has Verify JWT **on** — turn it off.
Check **Edge Functions → Logs** for any errors.
