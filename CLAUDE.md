# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server:**
```bash
npm start        # Start Expo development server
npm run android  # Start on Android device/emulator
npm run ios      # Start on iOS device/simulator
npm run web      # Start web development server
```

**Testing:**
```bash
npm test         # Run tests with Jest in watch mode
```

## Project Architecture

**KARO** is a basketball ranking and match management mobile app built with React Native and Expo Router.

### Tech Stack
- **Framework:** React Native with Expo SDK ~54.0.9
- **Navigation:** Expo Router v6 with file-based routing
- **State Management:** React Context with useReducer pattern
- **UI Components:** React Native with custom theming
- **Platform Support:** iOS, Android, and Web
- **TypeScript:** Full TypeScript support with typed routes

### Architecture Patterns

**File-Based Routing:**
- Uses Expo Router with app directory structure
- Tab navigation in `app/(tabs)/` directory
- Supports modal presentations and stack navigation
- Typed routes enabled via experiments.typedRoutes

**State Management:**
- Centralized state via `contexts/AppContext.tsx`
- useReducer pattern for complex state updates
- Mock data for development (MOCK_USERS, MOCK_MATCHES)
- Actions: SET_USER, ADD_MATCH, ADD_PENDING_MATCH, UPDATE_MATCH, etc.

**Component Structure:**
- Shared components in `/components` directory
- Themed components using color scheme system
- Platform-specific adjustments for Android/iOS navigation

### Key App Features

**Core Entities:**
- **User:** Profiles with ranking scores, win/loss records, friends
- **Match:** Confirmed basketball games with scores and results
- **PendingMatch:** Scheduled games waiting for score input
- **UserStats:** Calculated statistics including win rate and recent matches

**Tab Navigation Structure:**
- **홈 (Home):** User dashboard with rank card and recent matches
- **경기 (Match):** Match management and scheduling
- **랭킹 (Ranking):** User rankings sorted by rank score
- **통계 (Stats):** Detailed statistics and analytics
- **마이 (Profile):** User profile and settings

**Design System:**
- Dark theme with neon accents (lime #C6FF00, cyan #00E5FF)
- Pure black background (#000000) with dark gray surfaces
- Korean language UI with basketball-themed iconography
- Android-specific safe area handling for navigation bars

### Data Flow
1. AppContext provides global state via React Context
2. Mock data loaded on app initialization
3. Actions dispatched through reducer for state updates
4. Components consume state via useApp custom hook
5. Stats calculated dynamically from match history

### Development Notes
- Mock data used for all user interactions
- No backend integration currently implemented
- TypeScript interfaces defined in `/types/index.ts`
- Custom color theme in `/constants/Colors.ts`
- Safe area handling for various device types and Android navigation