# Local Development Build Setup (Xcode)

## Prerequisites

- ✅ Xcode installed
- ✅ iOS development certificate configured
- ✅ iPhone connected via USB or same WiFi network

---

## Step 1: Configure Clerk

1. **Get Clerk Publishable Key**
   - Go to [https://clerk.com](https://clerk.com)
   - Create account and new application
   - Copy publishable key (starts with `pk_test_...`)

2. **Create .env file**

   ```bash
   # Create .env in project root
   touch .env
   ```

3. **Add Clerk key to .env**
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

---

## Step 2: Generate Native iOS Folder

Run prebuild to generate the `ios/` folder:

```bash
npx expo prebuild --platform ios
```

**What this does:**

- Creates `ios/` folder with Xcode project
- Links all native modules (Clerk, AsyncStorage, etc.)
- Configures app.json settings

---

## Step 3: Install CocoaPods Dependencies

```bash
cd ios
pod install
cd ..
```

This installs all iOS native dependencies.

---

## Step 4: Open in Xcode

```bash
open ios/Aera.xcworkspace
```

⚠️ **Important:** Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

---

## Step 5: Configure Xcode

1. **Select your iPhone**
   - Top bar → Select your connected iPhone as target device

2. **Select your Team**
   - Click on project name in left sidebar
   - Select "Aera" target
   - Go to "Signing & Capabilities" tab
   - Select your Apple Developer Team
   - Or choose "Personal Team" if testing locally

3. **Update Bundle Identifier (if needed)**
   - Change bundle ID to something unique if you get signing errors
   - Example: `com.yourname.aera`

---

## Step 6: Build and Run

1. **Click the Play button** (▶️) in Xcode
2. **Wait for build** (~2-3 minutes first time)
3. **App installs on your iPhone**

---

## Step 7: Start Metro Bundler

In your project terminal:

```bash
npm start
```

The app should connect automatically!

---

## Development Workflow

Once set up, your workflow is:

1. **Make code changes** in your editor
2. **Metro auto-reloads** the app
3. **Only rebuild in Xcode** when:
   - Adding new native modules
   - Changing app.json configuration
   - Updating iOS permissions

For JavaScript/TypeScript changes, just save and Metro will reload!

---

## Troubleshooting

### "No certificate found"

```bash
# In Xcode:
# Signing & Capabilities → Automatically manage signing → Enable
```

### "App won't connect to Metro"

```bash
# Shake iPhone → "Configure Bundler"
# Enter your Mac's IP address: 192.168.x.x:8081
```

### "Build failed - CocoaPods"

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### "Module not found" errors

```bash
# Clean and rebuild
npx expo prebuild --clean
cd ios && pod install && cd ..
```

---

## Quick Commands

```bash
# Rebuild iOS native folder
npx expo prebuild --platform ios --clean

# Reinstall pods
cd ios && pod install && cd ..

# Start dev server
npm start

# Open in Xcode
open ios/Aera.xcworkspace
```

---

## Notes

✅ **Advantages of this workflow:**

- Full control over native code
- Faster iteration (no cloud build wait)
- Can debug in Xcode
- Free (no EAS required)

⚠️ **Remember:**

- Keep `ios/` folder in `.gitignore` (already configured)
- Run `expo prebuild` again if you add native modules
- Always open `.xcworkspace`, not `.xcodeproj`
