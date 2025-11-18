# Chromatic - Deployment Guide

## What You're Building

A professional color palette extraction tool with:
- Upload any image → extract dominant colors
- Color harmonies (complementary, triadic, split-complementary, analogous, tetradic)
- Tints and shades for each color
- WCAG contrast analysis with accessibility ratings
- Typography preview showing colors in context
- Export to CSS, SCSS, Tailwind, and JSON

---

## Step-by-Step Deployment

### Step 1: Create a GitHub Account (if you don't have one)

**Link:** https://github.com/signup

1. Go to the link above
2. Enter your email, create a password
3. Verify your email

---

### Step 2: Install Git on Your Computer

**Mac:** Open Terminal and run:
```bash
xcode-select --install
```

**Windows:** Download from https://git-scm.com/download/win

**Verify installation:** Open Terminal/Command Prompt and type:
```bash
git --version
```

---

### Step 3: Install Node.js

**Link:** https://nodejs.org/

1. Go to the link above
2. Download the **LTS version** (the big green button)
3. Run the installer, accept defaults

**Verify installation:**
```bash
node --version
npm --version
```

---

### Step 4: Download Your App Files

Download the project folder I created. The structure should be:

```
color-palette-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    └── App.jsx
```

---

### Step 5: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `chromatic` (or whatever you prefer)
3. Leave it **Public**
4. Do NOT check "Add a README file"
5. Click **Create repository**

---

### Step 6: Push Your Code to GitHub

Open Terminal/Command Prompt, navigate to your project folder:

```bash
cd path/to/color-palette-app
```

Then run these commands one at a time:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/chromatic.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

### Step 7: Deploy to Vercel (Easiest Option)

**Link:** https://vercel.com/signup

1. Go to the link above
2. Click **Continue with GitHub**
3. Authorize Vercel to access your GitHub

**Deploy your app:**

1. Go to https://vercel.com/new
2. Click **Import** next to your `chromatic` repository
3. Vercel auto-detects it's a Vite project
4. Click **Deploy**
5. Wait ~60 seconds

**Done!** You'll get a URL like `chromatic-abc123.vercel.app`

---

## Alternative: Deploy to Netlify

**Link:** https://netlify.com/signup

1. Sign up with GitHub
2. Click **Add new site** → **Import an existing project**
3. Select GitHub and authorize
4. Choose your `chromatic` repository
5. Build settings are auto-detected:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy site**

---

## Custom Domain (Optional)

### On Vercel:
1. Go to your project dashboard
2. Click **Settings** → **Domains**
3. Add your domain
4. Update your DNS records as instructed

### On Netlify:
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow the DNS setup instructions

---

## Local Development

To run the app locally before deploying:

```bash
cd color-palette-app
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Quick Reference Links

| Task | Link |
|------|------|
| Create GitHub account | https://github.com/signup |
| Install Node.js | https://nodejs.org/ |
| Install Git (Windows) | https://git-scm.com/download/win |
| Create new GitHub repo | https://github.com/new |
| Deploy on Vercel | https://vercel.com/new |
| Deploy on Netlify | https://app.netlify.com/start |
| Vercel docs | https://vercel.com/docs |
| Netlify docs | https://docs.netlify.com |

---

## Troubleshooting

**"npm not found"**
→ Restart your terminal after installing Node.js

**"git not found"**
→ Restart your terminal after installing Git

**Build fails on Vercel/Netlify**
→ Make sure all files are committed and pushed to GitHub

**Blank page after deploy**
→ Check browser console for errors (F12 → Console tab)

---

## Making Updates

After making changes to your code:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel/Netlify will automatically rebuild and deploy your updated app within ~60 seconds.
