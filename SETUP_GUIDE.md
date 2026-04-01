# EcoPulse - Setup & Quick Start Guide

## 🏁 Immediate Next Steps

### Step 0: Verify Installation
```bash
# In EcoPulseMobile directory
npm install

# Verify Expo is installed
expo --version
```

### Step 1: Start Development Server
```bash
npm start
```

You should see:
```
█ Metro waiting on exp://localhost:19000
```

### Step 2: Test the App

**Option A: Expo Go (Easiest)**
1. Download "Expo Go" app on your Android phone
2. Open the app
3. Scan QR code shown in terminal
4. App will load on your device

**Option B: Android Emulator**
1. Open Android Studio
2. Start Android Emulator
3. Press `a` in terminal
4. App will build and open

**Option C: iOS Simulator (Mac only)**
1. Have Xcode installed
2. Press `i` in terminal
3. App will open in simulator

## ✅ Currently Implemented

Your app now has:

✓ **Splash Screen** - Beautiful launch screen
✓ **Login Screen** - Authentication UI with sign-up toggle
✓ **Home Dashboard** - Daily carbon score, quick actions, eco tips
✓ **Habits Screen** - Habit tracking with completion toggles
✓ **Community Screen** - Leaderboards, achievements, stats
✓ **Profile Screen** - User profile, badges, settings
✓ **Bottom Tab Navigation** - All screens accessible from tabs
✓ **Responsive Design** - Proper spacing and styling

## 🔧 Configuration Needed

### 1. Firebase Setup (Required for production)

**Option A: Use Demo/Mock Data (Recommended for now)**
- App works with mock data
- Perfect for testing UI/UX
- No Firebase setup required

**Option B: Full Firebase Integration**

1. Create Firebase Project:
   - Go to [firebase.google.com/console](https://console.firebase.google.com)
   - Click "New Project"
   - Name: `EcoPulse`
   - Create project

2. Register Android App:
   - In Firebase: Settings → "Your apps" → "Add app" → "Android"
   - Package name: `com.ecopulse.app`
   - Download `google-services.json`
   - Save to: `android/app/google-services.json`

3. Get Credentials:
   - Settings → "Project settings"
   - Copy config values

4. Update firebase.ts:
```typescript
// src/services/firebase.ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. App Icons & Splash Screen

Create images in `assets/images/`:

**app-icon.png (1024x1024px)**
- Green background (#2ecc71)
- White leaf emoji or text
- PNG format

**splash.png (1080x2340px)**  
- Green gradient background
- "EcoPulse" text
- "Small Steps, Global Changes" tagline
- PNG format

**adaptive-icon.png (1024x1024px)**
- Leaf icon centered in safe zone
- PNG with transparency

## 📱 Testing Checklist

After launching, test:

- [ ] **Splash Screen** - Shows for 3 seconds then goes to Login
- [ ] **Login** - Can type email and password
- [ ] **Sign Up Toggle** - Can switch between login and signup
- [ ] **Home Screen** - All sections visible
- [ ] **Carbon Score** - Displays properly
- [ ] **Quick Actions** - Tappable with alerts
- [ ] **Habits Screen** - Shows all habits with checkboxes
- [ ] **Toggle Habits** - Can mark complete/incomplete
- [ ] **Community Screen** - Shows leaderboard and stats
- [ ] **Profile Screen** - Shows user info and badges
- [ ] **Navigation** - All tabs work properly
- [ ] **No Crashes** - App doesn't crash on navigation

## 🎯 When Ready to Deploy

### To Play Store:
1. Follow [PLAY_STORE_DEPLOYMENT.md](./PLAY_STORE_DEPLOYMENT.md)
2. Takes the Firebase setup from above
3. Build APK/AAB
4. Submit to Google Play

### To TestFlight (iOS):
1. Need Mac with Xcode
2. Follow Expo docs for iOS build
3. Similar process to Android

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `src/screens/*.tsx` | All app screens |
| `src/navigation/AppNavigator.tsx` | Tab/stack navigation setup |
| `src/theme/colors.ts` | Color definitions |
| `src/services/firebase.ts` | Firebase config |
| `app.json` | Expo/app configuration |
| `package.json` | Dependencies |

## 🐛 Troubleshooting

### App Won't Start
```bash
# Clear cache and restart
npm start --clear
```

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Android emulator issues
1. Restart Android Studio
2. Restart emulator
3. Run `npm start` again
4. Press `a`

### Expo Go QR code won't scan
1. Make sure phone is on same WiFi as computer
2. Restart Expo: Press `r` in terminal
3. Try scanning again

## 🎬 Demo Data

The app includes sample data:
- **Users**: Alex Rivera (avatar, level, stats)
- **Habits**: Transport, Food, Energy, Household activities
- **Community**: Top contributors, achievements, milestones
- **Scores**: 75 daily carbon score, 5/8 habits completed

All data is hardcoded for demo purposes.

## 🔐 Before First Launch to Production

- [ ] Replace mock data with Firebase
- [ ] Set up proper authentication
- [ ] Create privacy policy
- [ ] Design app icons
- [ ] Test thoroughly on device
- [ ] Complete Firebase setup
- [ ] Configure Google Play Store account

## 📊 Performance Tips

- Keep habit list < 100 items (use pagination for more)
- Optimize images before release
- Use React.memo for expensive components
- Implement lazy loading for community data

## 🎨 Customization Examples

### Change Primary Color
```typescript
// src/theme/colors.ts
primary: "#1abc9c"  // Change from green to teal
```

### Modify Habit Categories
```typescript
// src/screens/HabitsScreen.tsx
const categoryColors = {
  transport: "#FF6B6B",
  food: "#4ECDC4",
  energy: "#FFE66D",
  household: "#95E1D3",
  // Add new categories here
};
```

### Add New Screens
```typescript
// 1. Create src/screens/NewScreen.tsx
// 2. Add to AppNavigator.tsx
// 3. Add tab configuration
// 4. Export from navigation
```

## 📞 Need Help?

1. **App Crashes**: Check terminal for error messages
2. **Firebase Issues**: Go to Firebase Console → Diagnostics
3. **Styling Issues**: Check `styles.` properties
4. **Navigation Problems**: Review AppNavigator.tsx

## 🚀 Next Major Steps

1. **Firebase Integration** (1-2 hours)
   - Set up Firestore database
   - Add authentication
   - Sync user data

2. **Real Data** (2-3 hours)
   - Load habits from Firebase
   - Real user authentication
   - Real community stats

3. **Polish** (2-3 hours)
   - Animations
   - Error handling
   - Loading states
   - Toast notifications

4. **Play Store** (1-2 hours)
   - Create signed APK
   - Write descriptions
   - Design screenshots
   - Submit for review

## 📈 Suggested Timeline

- **Week 1**: Firebase setup + real authentication
- **Week 2**: Connect all data to Firebase, test thoroughly
- **Week 3**: UI polish, bug fixes, optimize performance
- **Week 4**: Play Store submission and monitoring

## 💡 Pro Tips

1. **Always commit to Git**: `git commit -m "description"`
2. **Test on real device**: Emulator doesn't catch everything
3. **Keep bundle size small**: Monitor with `eas build`
4. **Backup your code**: Use GitHub/GitLab
5. **Gather user feedback**: Critical for success

## Running Tests

```bash
# Run linter
npm run lint

# Fix lint issues
npm run lint --fix
```

## Building for Different Environments

```bash
# Development (reload on save)
npm start

# Staging build
eas build --platform android

# Production build (signed)
eas build --platform android --release
```

---

**Happy Coding! 🌿**

Start with `npm start` and you'll see the app running in seconds!

For detailed Play Store deployment, see [PLAY_STORE_DEPLOYMENT.md](./PLAY_STORE_DEPLOYMENT.md)
