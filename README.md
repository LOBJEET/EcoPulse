# EcoPulse - Digital Environmental Awareness App

[![Live App on Google Play](https://img.shields.io/badge/Live%20App-Google%20Play-brightgreen?logo=google-play)](https://play.google.com/store/apps/details?id=com.ecopulse.tracker)

## 🚀 Live App
Open EcoPulse directly on Google Play: https://play.google.com/store/apps/details?id=com.ecopulse.tracker

## 📱 About EcoPulse

EcoPulse is a mobile application that promotes environmental awareness and encourages users to adopt eco-friendly habits through gamification, community engagement, and real-time tracking.

### 🎯 Mission
Increase public awareness about climate change and sustainability while empowering users to make measurable environmental impact through daily actions.

### ✨ Key Features

- **🏠 Home Dashboard**: Daily carbon score tracking and quick action buttons
- **✅ Habit Tracking**: Track eco-friendly habits across categories (transport, food, energy, household)
- **🌍 Community Impact**: View community-wide environmental metrics and leaderboards
- **🏆 Gamification**: Earn badges, levels, and rewards for completing habits
- **💡 Personalized Tips**: AI-powered sustainability recommendations
- **👤 User Profile**: Track personal progress, badges, and statistics

## � App Screenshots

![EcoPulse Home Dashboard](assets/images/1000109243.jpg)

![EcoPulse Carbon Impact](assets/images/1000109248.png)

![EcoPulse Habit Tracking](assets/images/1000109247.png)

![EcoPulse Community Impact](assets/images/1000109244.png)

![EcoPulse Group Chat](assets/images/1000109245.png)

![EcoPulse Profile and Progress](assets/images/1000109246.png)

## �📋 Product & Project Structure

```
EcoPulseMobile/
├── App.tsx                        # App entry point
├── app.json                       # Expo app configuration
├── eas.json                       # EAS build configuration
├── package.json                   # npm dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── google-services.json           # Firebase Android config
├── firestore.rules                # Firebase security rules
├── android/                       # Native Android project files
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── settings.gradle
│   ├── app/
│   │   ├── build.gradle
│   │   ├── google-services.json
│   │   ├── proguard-rules.pro
│   │   └── src/
│   │       ├── debug/
│   │       │   └── AndroidManifest.xml
│   │       ├── debugOptimized/
│   │       │   └── AndroidManifest.xml
│   │       └── main/
│   │           ├── AndroidManifest.xml
│   │           ├── java/
│   │           │   └── com/ecopulse/app/
│   │           │       ├── MainActivity.kt
│   │           │       └── MainApplication.kt
│   │           └── res/
│   │               ├── drawable/
│   │               ├── drawable-hdpi/
│   │               ├── drawable-mdpi/
│   │               ├── drawable-xhdpi/
│   │               ├── drawable-xxhdpi/
│   │               ├── drawable-xxxhdpi/
│   │               ├── mipmap-anydpi-v26/
│   │               ├── mipmap-hdpi/
│   │               ├── mipmap-mdpi/
│   │               ├── mipmap-xhdpi/
│   │               ├── mipmap-xxhdpi/
│   │               ├── mipmap-xxxhdpi/
│   │               ├── values/
│   │               └── values-night/
├── src/                           # Application source code
│   ├── components/
│   │   ├── HabitCard.tsx           # Habit card component
│   │   └── PrimaryButton.tsx       # Reusable button component
│   ├── context/
│   │   ├── AuthContext.tsx         # Global auth state
│   │   └── HabitContext.tsx        # Habit state management
│   ├── hooks/
│   │   └── useAuth.ts              # Auth custom hook
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # Navigation structure
│   │   └── types.ts                # Navigation types
│   ├── screens/
│   │   ├── CommunityGroupDetailScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   ├── GroupChatRoomScreen.tsx
│   │   ├── GroupChatsListScreen.tsx
│   │   ├── HabitsScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── services/
│   │   ├── authService.ts          # Authentication logic
│   │   ├── communityAnalyticsService.ts
│   │   ├── communityService.ts
│   │   ├── firebase.ts             # Firebase configuration
│   │   ├── groupChatService.ts
│   │   ├── habitService.ts         # Habit management
│   │   ├── logService.ts
│   │   └── profilePreferencesService.ts
│   ├── theme/
│   │   └── colors.ts               # Color scheme
│   └── types/
│       ├── Habit.ts                # Habit data type
│       ├── User.ts                 # User data type
│       └── firebase-auth-react-native.d.ts
└── assets/
    └── images/
        ├── 1000109243.jpg
        ├── 1000109244.png
        ├── 1000109245.png
        ├── 1000109246.png
        ├── 1000109247.png
        ├── 1000109248.png
        ├── app-icon.png
        ├── splash.png
        └── adaptive-icon.png
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Android Studio or Xcode (for testing)
- Firebase project

### Installation

1. **Clone & Install**
```bash
cd EcoPulseMobile
npm install
```

2. **Configure Firebase**
```bash
# Update src/services/firebase.ts with your credentials
# Or create .env file:
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... (see PLAY_STORE_DEPLOYMENT.md for full list)
```

3. **Run Development Server**
```bash
npm start
```

4. **Test on Device**
- Android: Press `a` for Android emulator
- iOS: Press `i` for iOS simulator

## 🎨 Design System

### Colors
```javascript
{
  primary: '#2ecc71',       // Main green
  primaryDark: '#27ae60',   // Dark green
  background: '#ffffff',    // White
  textDark: '#2c3e50',     // Dark text
  success: '#27ae60',       // Green
  error: '#e74c3c'         // Red
}
```

### Typography
- **Headers**: 24-28px, Bold
- **Body**: 14-16px, Regular
- **Small**: 12px, Regular

### Components
- **Buttons**: Primary (green), Secondary (outline)
- **Cards**: White background, subtle shadow
- **Navigation**: Bottom tab bar with 4 tabs

## 🔐 Security & Privacy

### Authentication
- Firebase Authentication (Email/Password)
- JWT tokens for API calls
- Secure credential storage

### Data Protection
- HTTPS encrypted connections
- Firebase Security Rules for database access
- User consent for data collection
- Option to delete account with all data

### Privacy Policy
- Clear data collection disclosure
- GDPR compliant
- Option to make profile private

## 📊 Database Schema (Firestore)

### users Collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  avatar: string,
  carbonScore: number,
  level: number,
  badges: string[],
  joinedDate: timestamp,
  preferences: {
    notifications: boolean,
    privateProfile: boolean
  }
}
```

### habits Collection
```javascript
{
  habitId: string,
  userId: string,
  category: 'transport'|'food'|'energy'|'household',
  title: string,
  description: string,
  carbonReduction: number,
  completed: boolean,
  completedDate: timestamp,
  frequency: 'daily'|'weekly'|'monthly'
}
```

### communityStats Collection
```javascript
{
  totalUsers: number,
  totalCarbonReduced: number,
  habitsCompleted: number,
  lastUpdated: timestamp,
  monthlyData: [{
    month: string,
    carbonReduced: number,
    users: number
  }]
}
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **Icons**: Material Community Icons
- **Styling**: React Native StyleSheet

## 📱 Platform Support

- **Android**: 8.0+ (API 26+)
- **iOS**: 13.0+ (when iOS build is configured)

## 🚢 Deployment

### Development
```bash
npm start
```

### Testing
```bash
# Android
npm run android

# Expo Go App (easiest for testing)
npm start
```

### Production Build
```bash
# See PLAY_STORE_DEPLOYMENT.md for detailed instructions
eas build --platform android --release
```

## 📖 Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Play Store Deployment](./PLAY_STORE_DEPLOYMENT.md)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Commit with descriptive messages: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 🐛 Known Issues & Limitations

- Currently uses mock habit data (will integrate with Firebase)
- Authentication is placeholder (needs Firebase Auth integration)
- Push notifications not yet implemented
- Offline functionality limited

## 🔜 Future Enhancements

- [ ] Push notifications for habit reminders
- [ ] Social sharing of achievements
- [ ] File upload for evidence of eco-actions
- [ ] Integration with wearables
- [ ] Carbon footprint calculator
- [ ] Video tutorials
- [ ] AR features for environmental impact visualization
- [ ] Multi-language support

## 📞 Support

- **Email**: support@ecopulse.app
- **Issues**: GitHub issues (when repo created)
- **Documentation**: See docs folder

## 📄 License

MIT License - See LICENSE file for details

## 🎓 Team

**Capstone Project - EcoPulse Team**
- Mobile App Development (React Native)
- UI/UX Design
- Backend Development (Firebase)

---

**Current Version**: 1.0.0  
**Last Updated**: February 2024  
**Status**: Deployed on Google Play Store  
**Play Store**: https://play.google.com/store/apps/details?id=com.ecopulse.tracker

---

### 🌱 Remember: Small actions, global impact!
