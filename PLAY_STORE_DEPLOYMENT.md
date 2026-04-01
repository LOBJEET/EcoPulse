# EcoPulse - Play Store Deployment Guide

## Step 1: Firebase Setup (Critical)

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name: `EcoPulse`
4. Enable Google Analytics
5. Click "Create project"

### 1.2 Register Android App
1. In Firebase Console, click "Add app" → "Android"
2. Package name: `com.ecopulse.app` (or your chosen name)
3. App nickname: `EcoPulse Mobile`
4. Download the `google-services.json` file
5. Place it in: `EcoPulseMobile/android/app/google-services.json`

### 1.3 Get Firebase Credentials
1. Go to Project Settings → "Your apps"
2. Copy the config values:
   ```
   API Key
   Auth Domain
   Project ID
   Storage Bucket
   Messaging Sender ID
   App ID
   ```

### 1.4 Update Environment Variables

Create `.env` file in project root:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Or update `src/services/firebase.ts` directly with your credentials.

## Step 2: Prepare Android Build

### 2.1 Update app.json
```json
{
  "expo": {
    "name": "EcoPulse",
    "slug": "ecopulse",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/app-icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2ecc71"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": false
          }
        }
      ]
    ],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#2ecc71"
      },
      "package": "com.ecopulse.app",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### 2.2 Required Assets
Create these image files in `assets/images/`:
- `app-icon.png` (1024x1024px - PNG)
- `splash.png` (1080x2340px - PNG)
- `adaptive-icon.png` (1024x1024px - PNG with safe zone)

For now, you can use simple green/white designs matching brand colors.

## Step 3: Generate Signed APK/AAB

### 3.1 Using Expo (Recommended)

```bash
# Install Expo CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create Android app signing key
eas credentials

# Build production AAB
eas build --platform android --release
```

### 3.2 Manual APK Generation

```bash
# Generate APK locally
expo build:android --type apk
```

## Step 4: Google Play Store Setup

### 4.1 Create Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Create developer account ($25 one-time fee)
3. Complete merchant profile setup

### 4.2 Create App Listing
1. Click "Create app"
2. App name: `EcoPulse`
3. Default language: English
4. Select category: `Productivity` or `Lifestyle`
5. Content rating questionnaire: Complete honestly
6. Click "Create app"

### 4.3 Prepare Store Listing

#### Basic Info
```
Title: EcoPulse - Eco-Friendly Habits Tracker
Short description: Track your daily eco-friendly habits and reduce your carbon footprint.

Full description:
🌿 Welcome to EcoPulse - Digital Environmental Awareness App

Promote sustainable practices through gamification and community engagement!

**Features:**
✅ Daily habit tracking for eco-friendly activities
✅ Real-time carbon footprint calculation
✅ Community impact dashboard with leaderboards
✅ Personalized eco-tips and challenges
✅ Achievement badges and levels
✅ Environmental awareness resources

**Why Use EcoPulse?**
• Combat climate change with daily actions
• Earn rewards through gamification
• Join a global community of green enthusiasts
• Monitor your environmental impact
• Get personalized sustainability recommendations

**What You Can Track:**
🚗 Transport: Carpooling, cycling, public transit
🍽️ Food: Vegetarian meals, sustainable shopping
⚡ Energy: Efficient usage, renewable sources
♻️ Household: Recycling, waste reduction

Be the change you want to see. Start your sustainable journey with EcoPulse today!

Support: support@ecopulse.app
```

#### Screenshots (Required)
You need 2-8 screenshots (1080x1920px):
1. Splash/Login screen
2. Home screen with carbon score
3. Daily habits tracking
4. Community leaderboard
5. Profile & achievements

Create mockups or take screenshots from your app.

#### Content Rating
- Rate your app appropriately
- Usually "Everyone" for EcoPulse

### 4.4 Add Permissions & Compliance
1. Privacy policy URL: Create one at [iubenda.com](https://www.iubenda.com)
2. Permissions: Internet, Network access
3. Content Guidelines: Accept all terms

## Step 5: Upload APK/AAB

### 5.1 Navigate to Release Section
1. Left menu → "Testing" → "Internal testing"
2. Click "Create new release"
3. Upload your AAB or APK file
4. Fill in release notes:
   ```
   Version 1.0.0 - Initial Launch
   
   - Complete eco-friendly habit tracking system
   - Real-time carbon footprint calculation
   - Community impact dashboard
   - Gamification with badges and levels
   - Personalized sustainability tips
   - Global leaderboards
   ```

### 5.2 Test Internal Release
1. Add test users (Gmail addresses)
2. Send internal testing link
3. Get feedback from testers
4. Fix any issues

### 5.3 Move to Open Testing
1. Once stable, select "Open testing" release track
2. Set target audience
3. Submit for review (Google reviews in 2-3 hours usually)

## Step 6: Production Release

### 6.1 Final Checks
- [ ] App runs smoothly
- [ ] All screens work properly
- [ ] Authentication functioning
- [ ] No crashes or errors
- [ ] Privacy policy in place
- [ ] Terms of service ready
- [ ] Store listing complete
- [ ] Screenshots uploaded
- [ ] Appropriate rating selected

### 6.2 Submit for Production Review
1. Go to "Releases" → "Production"
2. Create new release
3. Select your tested AAB/APK
4. Add release notes
5. Click "Review release"
6. Review all details
7. Click "Start rollout to Production"

### 6.3 Review Process
- Google Play reviews typically take 24-48 hours
- You'll receive email once approved
- App will appear on Play Store within hours

## Step 7: Post-Launch

### 7.1 Monitor App Performance
1. Track crashes/errors in Play Console
2. Monitor user ratings and reviews
3. Track install statistics
4. Monitor performance metrics

### 7.2 Handle User Feedback
- Respond to reviews (especially negative ones)
- Fix bugs quickly
- Plan feature updates
- Manage ratings

### 7.3 Regular Updates
- Push updates every 2-4 weeks
- Add new features
- Improve performance
- Fix reported bugs
- Increase awareness with marketing

## Important Notes

⚠️ **Before Publishing:**
- Test thoroughly on real Android devices
- Ensure Firebase is properly configured
- Update privacy policy with actual data handling
- Verify all links work
- Check for any hardcoded test data
- Test user authentication flow
- Verify app permissions

📱 **Device Compatibility:**
- Minimum SDK: Android 8.0 (API 26)
- Target SDK: Android 13+ (API 33+)
- Test on multiple devices/sizes

🔐 **Security:**
- Never commit credentials to Git
- Use environment variables
- Enable Firebase Security Rules
- Implement proper authentication

💰 **Monetization (Optional):**
- Free model: Good for environmental apps
- In-app purchases: Premium features
- Ads: Sustainable partnerships

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
expo build:android --clear-cache
```

### APK Size Too Large
- Use AAB format (50% smaller)
- Run `expo optimize`

### Authentication Issues
- Verify credentials in firebase.ts
- Check Firebase Security Rules
- Enable Authentication in Firebase Console

## Contact & Support

For issues with:
- **Expo Build**: [Expo EAS Docs](https://docs.expo.dev/build/setup/)
- **Play Store**: [Google Play Console Help](https://support.google.com/googleplay)
- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)

## Estimated Timeline

| Task | Duration |
|------|----------|
| Firebase Setup | 15 minutes |
| App Preparation | 1-2 hours |
| APK/AAB Build | 10-30 minutes |
| Play Store Setup | 1-2 hours |
| Internal Testing | 2-3 days |
| Play Store Review | 24-48 hours |
| **Total** | **3-5 days** |

---

**Version**: 1.0.0  
**Last Updated**: February 2024  
**Next Review**: Before each update
