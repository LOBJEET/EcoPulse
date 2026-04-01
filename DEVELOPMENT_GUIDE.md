# EcoPulse Mobile App - Development & Play Store Deployment Guide

## Project Overview
**App Name:** EcoPulse  
**Description:** Digital Environmental Awareness App promoting eco-friendly habits through gamification and community engagement.

## Key Features
1. **Authentication** - Secure login/registration with Firebase
2. **Daily Carbon Score** - Track daily environmental impact
3. **Habit Tracking** - Monitor eco-friendly habits (Transport, Food, Energy, Household)
4. **Community Impact** - View community-wide environmental impact
5. **Personalized Tips** - AI-powered recommendations
6. **Leaderboards** - Gamification with community engagement

## Development Roadmap

### Phase 1: Core Setup ✓
- [x] Firebase authentication & Firestore setup
- [x] Project structure with TypeScript

### Phase 2: UI Screens (IN PROGRESS)
- [ ] Splash Screen
- [ ] Login/Sign-up Screen
- [ ] Home Screen (Carbon Score Dashboard)
- [ ] Daily Habits Screen
- [ ] Community Impact Screen
- [ ] Profile & Settings Screen

### Phase 3: Functionality
- [ ] Habit tracking logic
- [ ] Carbon score calculation
- [ ] Notification system
- [ ] Data persistence

### Phase 4: Play Store Deployment
- [ ] App signing & key generation
- [ ] App bundle creation
- [ ] Store listing setup
- [ ] Store submission

## Tech Stack
- **Framework:** React Native with Expo
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Navigation:** React Navigation with Bottom Tabs
- **State Management:** React Context
- **Styling:** React Native StyleSheet + Custom Theme

## Color Scheme
- **Primary Green:** #2ecc71
- **Dark Green:** #27ae60
- **Light Green:** #ecf0f1
- **Text Dark:** #2c3e50
- **Background:** #ffffff

## Database Schema

### Firestore Collections

#### `users`
```
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
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

#### `habits`
```
{
  habitId: string,
  userId: string,
  category: 'transport' | 'food' | 'energy' | 'household' | 'misc',
  title: string,
  description: string,
  carbonReduction: number,
  completed: boolean,
  completedDate: timestamp,
  frequency: 'daily' | 'weekly' | 'monthly'
}
```

#### `communityStats`
```
{
  totalUsers: number,
  totalCarbonReduced: number,
  habitsCompleted: number,
  lastUpdated: timestamp,
  topContributors: string[],
  monthlyData: {
    month: string,
    carbonReduced: number,
    users: number
  }[]
}
```

## Next Steps
1. Configure Firebase credentials
2. Implement authentication flow
3. Build UI screens according to design
4. Connect screens to Firebase
5. Test on Android emulator
6. Prepare for Play Store submission
