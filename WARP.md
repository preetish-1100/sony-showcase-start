# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Install dependencies
npm i

# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Testing and Quality
- No test framework is currently configured in this project
- ESLint is configured with TypeScript and React rules
- Unused variables and parameters are allowed per eslint config

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **Routing**: React Router DOM v6 with client-side routing
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom Sony LIV brand colors
- **State Management**: React Query (TanStack Query) for server state
- **API Integration**: TMDB (The Movie Database) API for content data

### Project Structure
```
src/
├── components/
│   ├── gamification/          # XP system, achievements, premium unlocks
│   ├── home/                  # Home page content sections and banners
│   ├── onboarding/            # Multi-step user onboarding flow
│   └── ui/                    # Reusable UI components (shadcn/ui)
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
├── pages/                     # Main application pages/routes
└── services/                  # External API services (TMDB)
```

### Key Application Flow
1. **Onboarding**: Multi-step flow (`welcome → otp → language → genre → content-type → location → completion`)
2. **Home Experience**: Personalized content based on user preferences with TMDB API integration
3. **Gamification**: XP system with levels (Newcomer → Bronze → Silver → Gold Viewer)
4. **Content Discovery**: Language and genre-based content recommendations

### Sony LIV Brand Integration
- Primary brand color: `#1565C0` (Sony LIV Blue) - defined as CSS custom property `--sonyliv-blue`
- Custom design system with Sony-specific color palette in `src/index.css`
- Responsive mobile-first design optimized for streaming app experience

### State Management Patterns
- **Local Storage**: User preferences and onboarding completion state
- **React Query**: TMDB API data fetching and caching
- **Component State**: UI interactions and temporary data
- **URL State**: Navigation and routing parameters

### API Integration
- **TMDB Service**: Centralized service class handling movie data, search, and content discovery
- **Language/Genre Mapping**: Custom mappings for Indian languages and content preferences
- **Content Personalization**: User preference-based content filtering

### Development Notes
- Path aliases configured: `@/` maps to `./src/`
- TypeScript with relaxed settings (implicit any allowed, unused vars allowed)
- Vite dev server runs on port 8080 with host `::`
- Component tagging enabled for Lovable platform integration

### Key Features to Understand
- **Onboarding Flow**: Complete user preference collection system
- **Gamification System**: XP earning through content consumption and engagement
- **TMDB Integration**: Real movie data with fallback placeholder system
- **Responsive Design**: Mobile-optimized with bottom navigation patterns
- **Premium Content**: Tiered content access with unlock mechanisms
- **Video Player**: Modal-based video player with XP earning system
- **Premium Unlock**: XP-based unlock system for premium content

## Project-Specific Guidelines

### Component Organization
- Place domain-specific components in feature folders (`gamification/`, `onboarding/`, `home/`, `video/`)
- Keep reusable UI components in `ui/` folder
- Use TypeScript interfaces for props and data structures
- Video player components in `video/` folder with full-screen support

### API Patterns
- Extend TMDB service class for new content types or endpoints
- Use React Query for all external API calls
- Implement proper error handling and loading states

### Styling Standards
- Use Tailwind CSS with custom Sony LIV design tokens
- Leverage CSS custom properties defined in `index.css`
- Maintain mobile-first responsive design approach

### State Persistence
- Use localStorage for user preferences and app state
- Implement proper error handling for JSON parsing
- Clear corrupted localStorage data gracefully

### Content Management
- TMDB API key is hardcoded for prototype purposes
- Content personalization should respect user language/genre preferences
- Implement proper image fallbacks for missing poster data

## Troubleshooting

### Images Not Loading on Homepage
If movie poster images aren't showing on the homepage:

1. **Check TMDB API connectivity**: The app uses The Movie Database (TMDB) API for content
2. **Network issues**: If TMDB is unreachable, the app uses fallback content with curated images
3. **Property mapping**: Ensure TMDB service `convertToContentItem()` returns `imageUrl` property
4. **Error handling**: Check browser console for API errors - the app should gracefully handle failures

### TMDB API Debugging
```bash
# Test TMDB API connectivity
curl "https://api.themoviedb.org/3/movie/popular?api_key=a920b40b16bf83b682220e54023bfb5c"

# Or use PowerShell
Invoke-WebRequest -Uri "https://api.themoviedb.org/3/movie/popular?api_key=a920b40b16bf83b682220e54023bfb5c"
```

### Onboarding Not Showing
If the onboarding flow doesn't appear on app startup:

1. **Check localStorage**: Open browser dev tools → Application → Local Storage
2. **Clear onboarding data**: Remove `onboardingCompleted` and `userPreferences` keys
3. **Force reset**: Add `?reset=true` to URL (e.g., `http://localhost:8080/?reset=true`)
4. **Use debug utility**: Load `debug-utils.js` in console and run `debugUtils.resetOnboarding()`

### Movie Details Not Loading
If movie details are inconsistent or not showing:

1. **Check movie ID format**: 
   - Fallback IDs: '1', '2', '3', '4', '5', '6' (for banner/homepage content)
   - TMDB IDs: numeric (e.g., 628, 447365) (for My List and API content)
2. **Verify navigation**: Check browser console for navigation errors
3. **Check network**: Ensure TMDB API is accessible
4. **Fallback system**: App should show fallback content when TMDB fails

### Preferences Not Respected
If content suggestions don't match onboarding preferences:

1. **Verify preferences saved**: Check localStorage for `userPreferences`
2. **Check format**: Preferences should include `languages`, `genres`, `contentTypes` arrays
3. **TMDB integration**: Personalized content uses `tmdbService.getMoviesByPreferences()`
4. **Fallback behavior**: When TMDB fails, uses popular content as personalized

### Debug Utilities
Use the included `debug-utils.js` file:

```javascript
// In browser console
debugUtils.checkLocalStorage()    // Check current state
debugUtils.resetOnboarding()      // Reset onboarding
debugUtils.setTestPreferences()   // Set test preferences
debugUtils.checkMovieIds()        // Show ID mappings
```
