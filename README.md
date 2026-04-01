# EcoPulse - Digital Environmental Awareness App

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

## 📋 Project Structure

```
EcoPulseMobile/
├── src/
│   ├── screens/
│   │   ├── SplashScreen.tsx          # Launch screen
│   │   ├── LoginScreen.tsx           # Authentication
│   │   ├── HomeScreen.tsx            # Main dashboard
│   │   ├── HabitsScreen.tsx          # Daily habit tracking
│   │   ├── CommunityScreen.tsx       # Community stats & leaderboard
│   │   └── ProfileScreen.tsx         # User profile & settings
│   ├── components/
│   │   ├── PrimaryButton.tsx         # Reusable button component
│   │   └── HabitCard.tsx             # Habit card component
│   ├── navigation/
│   │   └── AppNavigator.tsx          # Navigation structure
│   ├── services/
│   │   ├── firebase.ts               # Firebase configuration
│   │   ├── authService.ts            # Authentication logic
│   │   └── habitService.ts           # Habit management
│   ├── context/
│   │   └── AuthContext.tsx           # Global auth state
│   ├── hooks/
│   │   └── useAuth.ts                # Auth custom hook
│   ├── theme/
│   │   └── colors.ts                 # Color scheme
│   └── types/
│       ├── Habit.ts                  # Habit data type
│       └── User.ts                   # User data type
└── assets/
    └── images/
        ├── app-icon.png              # App icon
        ├── splash.png                # Splash screen
        └── adaptive-icon.png         # Adaptive icon
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
**Status**: Ready for Testing & Play Store Deployment

---

### 🌱 Remember: Small actions, global impact!
