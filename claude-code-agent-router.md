# How to Use Claude Code with Agent Router

## Introduction

Claude Code is Anthropic's powerful AI coding assistant that helps developers write, debug, and understand code faster. Normally, you access Claude through Anthropic's official subscription or Claude.ai platform.

**Agent Router** is a third-party API gateway that acts as an intermediary between your tools and AI models. It allows developers to route requests to various AI providers, including Claude, through a unified API interface.

In this guide, you'll learn how to configure Claude Code to work with Agent Router, enabling you to:
- Access Claude models through an alternative API gateway
- Manage API credentials securely
- Understand the request flow from your IDE to Anthropic's servers
- Troubleshoot configuration issues
- Follow security best practices

## Prerequisites

Before starting, make sure you have:

✓ **Claude Code** installed on your system (Windows, macOS, or Linux)
✓ **An active Agent Router account** (free account available)
✓ **A valid Agent Router API key** generated and stored securely
✓ **Terminal or command-line access** on your machine
✓ **Basic understanding of environment variables** and how to set them

## Understanding the Architecture

When you use Claude Code with Agent Router, here's what happens behind the scenes:

```
Your IDE (VS Code, JetBrains, etc.)
        ↓
   Claude Code
        ↓
   Agent Router API Gateway
        ↓
   Supported Claude Model
        ↓
   Response flows back through the same chain
```

**At each step:**
1. **Your IDE** sends code, questions, or requests through Claude Code
2. **Claude Code** formats your input and prepares the API call
3. **Agent Router** receives the request, validates your API key, and routes it appropriately
4. **Claude Model** processes the request and generates a response
5. **Response** flows back through Agent Router to Claude Code in your IDE

Agent Router acts as the gateway—it doesn't create the model responses; it connects you to Anthropic's APIs on your behalf.

## Step 1: Install Claude Code

### Windows

1. Download the Claude Code installer from the official Anthropic website
2. Run the installer (.exe file)
3. Follow the installation wizard
4. Choose your installation directory (default: `C:\Program Files\Claude Code`)
5. Complete the setup

**Verify installation** by opening PowerShell and running:
```powershell
claude --version
```

### macOS

Using Homebrew (recommended):
```bash
brew install anthropic/claude/claude-code
```

Or download directly from the Anthropic website and drag the application to your Applications folder.

**Verify installation:**
```bash
claude --version
```

### Linux

Download the appropriate package for your distribution, or use your package manager:

```bash
# For Ubuntu/Debian-based systems
sudo apt-get install claude-code

# For Fedora/RHEL-based systems
sudo dnf install claude-code
```

**Verify installation:**
```bash
claude --version
```

## Step 2: Create an Agent Router Account

**Step-by-step signup process:**

1. Visit **Agent Router's official website**: https://agentrouter.org/

⚠️ **Important Note:** The website is currently in **Chinese language**. To view in English:
   - Chrome: The browser will offer to translate. Click "Translate"
   - Firefox: Right-click → "Translate Page to English"
   - Any browser: Copy the URL to Google Translate at https://translate.google.com/

2. On the login page, you'll see three authentication options:

   ![Agent Router Login Page](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

   **Recommended: Continue with GitHub**
   - Click **"Continue with GitHub"** (easiest option)
   - Authorize Agent Router to access your GitHub account
   - You'll be redirected to complete the setup

   **Alternative: Sign in with Email**
   - Click **"Sign in with Email or Username"**
   - Enter your email address

3. Create a strong password (if using email option)
   - Recommended: 12+ characters, mix of uppercase, lowercase, numbers, symbols
   ![Password Manager](https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop)

4. Verify your email address (if using email option)
   - Check your inbox for verification link
   - Click the link to confirm your email

5. Complete any additional verification steps
   - May include phone verification or CAPTCHA

6. Log in to your Agent Router dashboard
   ![Dashboard Overview](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop)
   - You should see a welcome screen or dashboard

**Important Note:**
> Agent Router is a third-party service operated independently from Anthropic. Before using it with production workloads, review:
> - Pricing model and current rates
> - Privacy policy and data handling
> - Terms of service
> - Current model availability and limits
> - Any usage restrictions or fair-use policies

The interface and features may change, so always refer to Agent Router's current documentation for the latest information.

## Step 3: Generate an API Key

Once logged into Agent Router:

1. Navigate to **API Token** section in your dashboard (left sidebar)
   - Look for "API Token" in the console menu

2. Click **"Create"** button to create a new token
   ![Create New Token Dialog](https://images.unsplash.com/photo-1526374965328-7f5ae4e8a83f?w=800&h=400&fit=crop)

3. Configure your token:
   - **Name**: Give it a descriptive name (e.g., "Claude Code - Development")
   - **Token grouping**: Select or leave as default
   - **Expiration time**: Choose "Never expires" for development use
   - **New quantity**: Set to 1

4. Under **Quota Settings**:
   - Set your token quota (or leave unlimited)
   - This limits the token's maximum usage

5. Under **Access Restrictions**:
   - Select models supported by your token
   ![Model Restrictions](https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop)
   - You can choose specific models like:
     - claude-opus-4-8
     - claude-opus-5
     - Or leave blank to support all models

6. Click **"Create"** button
   ![Generated Token Display](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop)

7. **⚠️ Copy the entire API key immediately** — you won't see it again
   - Copy to clipboard
   - Don't close this window until you've saved it

8. Store it securely in a password manager or `.env` file (never in version control)
   - Password managers: 1Password, LastPass, Bitwarden
   - Keep it safe like your bank password

**Example API Key format:**
```
YOUR_AGENT_ROUTER_API_KEY
```

⚠️ **Security Warning:** Never use a real API key in public repositories, screenshots, or documentation.

## Step 4: Configure Claude Code

Now you'll set up Claude Code to use Agent Router's endpoints instead of the default configuration.

![Configuration Setup](https://images.unsplash.com/photo-1516321318423-f06f70259c13?w=800&h=400&fit=crop)

### Using Environment Variables

Create or edit your `.env` file in your project directory or system-wide:

**Linux / macOS:**

Open your terminal and edit your shell profile:
```bash
# Edit your shell profile
nano ~/.bashrc
# or
nano ~/.zshrc

# Add these lines:
export ANTHROPIC_AUTH_TOKEN="YOUR_AGENT_ROUTER_API_KEY"
export ANTHROPIC_BASE_URL="YOUR_AGENT_ROUTER_BASE_URL"
export ANTHROPIC_MODEL="claude-3-5-sonnet"

# Save with Ctrl+O, Enter, Ctrl+X
# Then reload:
source ~/.bashrc
```

Or create a `.env` file in your project:
```bash
# Create in your project root
cat > .env << 'EOF'
export ANTHROPIC_AUTH_TOKEN="YOUR_AGENT_ROUTER_API_KEY"
export ANTHROPIC_BASE_URL="YOUR_AGENT_ROUTER_BASE_URL"
export ANTHROPIC_MODEL="claude-3-5-sonnet"
EOF
```

**Windows PowerShell:**

Open PowerShell and run:
```powershell
# Set environment variables
$env:ANTHROPIC_AUTH_TOKEN = "YOUR_AGENT_ROUTER_API_KEY"
$env:ANTHROPIC_BASE_URL = "YOUR_AGENT_ROUTER_BASE_URL"
$env:ANTHROPIC_MODEL = "claude-3-5-sonnet"

# Verify they're set
Get-Item env:ANTHROPIC_AUTH_TOKEN
```

Or create a `.env` file in your project:
```powershell
# Create .env file
@"
ANTHROPIC_AUTH_TOKEN=YOUR_AGENT_ROUTER_API_KEY
ANTHROPIC_BASE_URL=YOUR_AGENT_ROUTER_BASE_URL
ANTHROPIC_MODEL=claude-3-5-sonnet
"@ | Out-File -Encoding UTF8 .env
```

**Windows Command Prompt:**

Open Command Prompt and run:
```batch
set ANTHROPIC_AUTH_TOKEN=YOUR_AGENT_ROUTER_API_KEY
set ANTHROPIC_BASE_URL=YOUR_AGENT_ROUTER_BASE_URL
set ANTHROPIC_MODEL=claude-3-5-sonnet

# Verify (you should see the values)
echo %ANTHROPIC_AUTH_TOKEN%
```

### What Each Variable Means

| Variable | Purpose | Example |
|----------|---------|---------|
| `ANTHROPIC_AUTH_TOKEN` | Your Agent Router API key for authentication | YOUR_AGENT_ROUTER_API_KEY |
| `ANTHROPIC_BASE_URL` | Agent Router's API endpoint URL | https://api.agentrouter.com/v1 |
| `ANTHROPIC_MODEL` | The Claude model identifier to use | claude-3-5-sonnet |

> **Important:** Refer to Agent Router's current documentation to confirm the correct variable names, base URL format, and supported model identifiers. These may have changed since this guide was written.

## Step 5: Start Claude Code

### Launch from Terminal

After setting environment variables, open a new terminal and launch Claude Code:

```bash
claude
```

![Claude Code Launch](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop)

Claude Code should start with your Agent Router configuration loaded.

### Verify Your Configuration

Once Claude Code starts, check that it's using the correct settings:

![Claude Code Settings](https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop)

1. Open the settings or preferences
   - Look for gear icon or Settings menu
   - Keyboard shortcut often: `Ctrl+,` (Windows/Linux) or `Cmd+,` (macOS)

2. Look for "API Configuration" or "Model Settings"
   - You should see your Agent Router endpoint
   - Check the model name matches what you set

3. Verify it shows your selected model and Agent Router endpoint
   - Example: `claude-3-5-sonnet` 
   - Base URL should show Agent Router's endpoint

4. Check that no "subscription required" or "login required" messages appear
   - If you see these, your configuration didn't load properly
   - Try restarting Claude Code and checking environment variables

### Common Checks If Something Fails

If Claude Code doesn't connect properly, verify:

| Check | What to Do |
|-------|-----------|
| Is the API key valid? | Double-check in Agent Router dashboard; regenerate if needed |
| Is the base URL correct? | Confirm the endpoint URL matches Agent Router's current documentation |
| Is the model name supported? | Check Agent Router's list of available models |
| Are env vars loaded? | Open a new terminal; environment variables set in one session don't always transfer to new processes |
| Do you have enough credits? | Check your Agent Router account dashboard for remaining credits or balance |
| Did the provider change requirements? | Visit Agent Router's docs; API configurations can change |

## Security Best Practices

Protecting your API credentials is critical. Follow these practices:

### ✓ Do:
- Store API keys in environment variables, not hardcoded in files
- Use a `.env` file for local development (add `.env` to `.gitignore`)
- Rotate keys regularly, especially if exposed
- Use different keys for different projects when possible
- Keep your API key secret—treat it like a password

### ✗ Don't:
- Paste API keys into GitHub, GitLab, or any public repository
- Include API keys in frontend JavaScript code (always backend-only)
- Share screenshots that show your API key
- Commit `.env` files to version control
- Use the same key for all projects
- Leave API keys in terminal history

### Setup `.gitignore`

Ensure your `.env` file is never committed:

```gitignore
# Environment variables (never commit these)
.env
.env.local
.env.*.local

# Optional: if you use multiple env files
.env.development
.env.production
```

You **can** create a `.env.example` file with placeholders:

```
# .env.example (safe to commit)
ANTHROPIC_AUTH_TOKEN=YOUR_AGENT_ROUTER_API_KEY
ANTHROPIC_BASE_URL=YOUR_AGENT_ROUTER_BASE_URL
ANTHROPIC_MODEL=claude-3-5-sonnet
```

## About Free Credit Promotions

Third-party API providers sometimes offer promotional credits to new users as an incentive to try their service.

**Important Disclaimer:**
At the time this guide was prepared, promotional information indicated that some Agent Router new user accounts might receive free trial credits. However:

- Promotional amounts and eligibility can change
- Credits may expire after a set period
- Not all features or models may be included
- Terms and conditions apply

> **Before signing up**, visit Agent Router's official website to check the current promotion. Do not create multiple accounts to obtain additional credits—this violates most service terms and can result in account suspension.

Always verify current offers directly with the provider.

## Example Workflow

Here's a step-by-step walkthrough of getting Claude Code running with Agent Router:

### 1. Install Claude Code
```bash
# macOS with Homebrew
brew install anthropic/claude/claude-code

# Verify
claude --version
```

### 2. Create Account
- Visit Agent Router website
- Sign up with email
- Verify your email

### 3. Generate API Token
- Log into Agent Router dashboard
- Go to API Keys section
- Create new key
- Copy and save securely

### 4. Set Environment Variables
```bash
export ANTHROPIC_AUTH_TOKEN="YOUR_AGENT_ROUTER_API_KEY"
export ANTHROPIC_BASE_URL="YOUR_AGENT_ROUTER_BASE_URL"
export ANTHROPIC_MODEL="claude-3-5-sonnet"
```

### 5. Launch Claude Code
```bash
claude
```

### 6. Start Coding
- Open your project
- Use Claude Code's autocomplete and suggestions
- Build with confidence

## Common Problems & Solutions

### Problem: "Unauthorized" Error

**Possible Causes:**
- API key is invalid or expired
- API key was generated but not copied correctly
- Key has been revoked or rotated

**Solution:**
1. Log into Agent Router dashboard
2. Go to API Keys section
3. Create a new key
4. Update your environment variables
5. Restart Claude Code

---

### Problem: "Model Not Found" Error

**Possible Causes:**
- Model identifier is incorrect
- Model is not available in your region or account tier
- Model name has changed

**Solution:**
1. Check Agent Router documentation for current model identifiers
2. Verify your account tier supports the requested model
3. Try using a different supported model
4. Update `ANTHROPIC_MODEL` environment variable

---

### Problem: "Connection Error" or "Timeout"

**Possible Causes:**
- Base URL is incorrect
- Network connectivity issue
- Agent Router API is temporarily down

**Solution:**
1. Verify base URL in Agent Router docs: `https://api.agentrouter.com/v1` (example)
2. Test your internet connection
3. Check Agent Router's status page
4. Restart your terminal and Claude Code

---

### Problem: "Credit Limit Exceeded"

**Possible Causes:**
- Free promotional credits have been used
- Account balance is depleted
- Usage limit has been reached

**Solution:**
1. Log into Agent Router dashboard
2. Check your account credit balance
3. Review your usage in the dashboard
4. Upgrade your account or add credits
5. Wait for monthly credit reset if applicable

---

### Problem: Claude Code Still Asks to Sign In

**Possible Causes:**
- Environment variables not loaded
- Configuration not applied after restart
- Claude Code is using cached settings

**Solution:**
1. Close Claude Code completely
2. Verify environment variables are set: `echo $ANTHROPIC_AUTH_TOKEN`
3. Open a **new terminal window**
4. Launch Claude Code again
5. Check settings to confirm configuration loaded

## Frequently Asked Questions

### What is Agent Router?

Agent Router is a third-party API gateway service that routes requests to various AI models, including Anthropic's Claude. It provides a unified interface for accessing multiple AI providers. It is **not** affiliated with or operated by Anthropic.

### Is Agent Router the same as Anthropic?

**No.** Anthropic is the company that created Claude. Agent Router is an independent, third-party service that provides access to Claude's API. Using Agent Router means your requests go through their servers before reaching Anthropic's infrastructure.

### Do I need a Claude.ai subscription?

If you're using Agent Router's API gateway, you don't need a Claude.ai subscription. However, you do need:
- An Agent Router account
- A valid API key
- Credits or a payment method in Agent Router

Always check Agent Router's current terms for the most up-to-date requirements.

### Can I use Claude Code with an API provider?

Yes, if the API provider supports Claude models and exposes an OpenAI-compatible or Anthropic-compatible API endpoint, you can configure Claude Code to use it. Agent Router is one such provider.

### Are promotional credits permanent?

No. Promotional credits typically:
- Expire after 30-90 days
- Are used with the fastest models first
- May not cover all model types
- Reset with monthly subscription plans

Check Agent Router's terms for specifics.

### Is it safe to share an API key?

**Absolutely not.** An API key is like a password to your account. Never share it:
- In public repositories or Gists
- In screenshots or screen recordings
- With untrusted people or services
- In plain text files on shared computers

If you suspect your key has been exposed, regenerate it immediately in the Agent Router dashboard.

### Can I use this setup for production applications?

Potentially, but be aware:
- **You're relying on a third-party service.** Understand their uptime SLA and support.
- **Costs scale with usage.** Monitor your spending carefully.
- **Read the terms.** Some providers have restrictions on production use.
- **Have a fallback.** Consider what happens if Agent Router becomes unavailable.
- **Comply with all policies.** Review Anthropic's policies on third-party providers.

For mission-critical applications, consider Anthropic's official API directly.

### Why does Claude Code keep asking me to log in?

This usually means:
- Environment variables aren't set
- Claude Code isn't recognizing your configuration
- The API key is invalid

Try:
1. Close Claude Code completely
2. Open a new terminal
3. Set environment variables again
4. Launch Claude Code

### How do I change the Claude model?

Update the `ANTHROPIC_MODEL` environment variable:

```bash
export ANTHROPIC_MODEL="claude-3-opus"
```

Then restart Claude Code. Available models depend on what Agent Router supports.

## Conclusion

Configuring Claude Code to work with Agent Router is straightforward once you understand the setup process:

1. Install Claude Code
2. Create an Agent Router account
3. Generate an API key
4. Configure environment variables
5. Launch Claude Code
6. Start building

**Remember:**
- Agent Router is a third-party service—always review their current documentation, pricing, and terms
- Protect your API credentials like you protect your passwords
- Monitor your usage and costs
- Test thoroughly before relying on this setup for important work

The combination of Claude Code and a third-party API provider gives you flexibility in how you access powerful AI models. Use it responsibly and securely.

**Ready to explore more?** Check out Anthropic's official documentation or Agent Router's guides for advanced configurations.

---

## Sources & Further Reading

- [Official Claude Code Documentation](https://www.anthropic.com/research/claude)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Agent Router Documentation](https://agentrouter.com/docs) (confirm current URL)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Git Security: .gitignore](https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files)
