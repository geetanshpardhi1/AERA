# Clerk Authentication Setup Guide

## Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose **Email** as your authentication method
5. Copy your **Publishable Key** (starts with `pk_test_...`)

---

## Step 2: Configure Environment Variables

1. Create a `.env` file in your project root:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Clerk publishable key:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

---

## Step 3: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

---

## Step 4: Login to Expo

```bash
eas login
```

Enter your Expo account credentials (create one at expo.dev if needed).

---

## Step 5: Configure Your Project

```bash
eas build:configure
```

This will create `eas.json` in your project.

---

## Step 6: Build Development Build for iOS

```bash
eas build --profile development --platform ios
```

**What happens:**

- EAS will build your app with Clerk's native dependencies
- Build takes ~10-15 minutes
- You'll get a download link when complete

---

## Step 7: Install on Your iPhone

**Option A: Install via QR Code**

1. When build completes, scan the QR code with your iPhone camera
2. Follow the prompts to install

**Option B: Install via TestFlight** (if you have Apple Developer account)

1. EAS can automatically create a TestFlight build
2. You'll receive an email invite

---

## Step 8: Run Development Server

```bash
npm start
```

Then:

1. Open the custom development build on your iPhone (not Expo Go)
2. Scan the QR code or enter the URL
3. App will load with Clerk authentication working!

---

## Testing the Flow

### First-Time User

1. Launch app → Splash screen
2. Onboarding screens (3 slides)
3. Signup screen → Enter details
4. Check email for verification (if enabled)
5. Auto-login → Home feed

### Returning User

1. Launch app → Splash screen
2. Login screen → Enter credentials
3. Home feed

### Logout

1. Go to Profile tab
2. Tap Logout
3. Confirm → Returns to login

---

## Troubleshooting

### "Missing Clerk Publishable Key" Error

- Make sure `.env` file exists in project root
- Restart the development server after adding the key

### Build Fails

- Make sure you're logged into EAS: `eas whoami`
- Check that `eas.json` exists
- Try: `eas build --profile development --platform ios --clear-cache`

### App Won't Load After Install

- Make sure you're running `npm start` from your development machine
- Make sure your iPhone and computer are on the same network
- Try restarting the dev server

---

## Next Steps

After successful setup:

- Configure email settings in Clerk dashboard
- Add social auth (Google, Apple) via Clerk dashboard
- Customize email templates
- Enable multi-factor authentication

---

## Important Notes

⚠️ **Development Build vs Expo Go**

- You MUST use the custom development build (not Expo Go)
- Clerk requires native modules not available in Expo Go

⚠️ **Environment Variables**

- Never commit `.env` to git
- `.env` is already in `.gitignore`
- Use `.env.example` as a template for teammates

⚠️ **.env File Location**

- Must be in project root (same level as `package.json`)
- Not in `app/` or any subdirectory
