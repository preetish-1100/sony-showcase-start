# TMDB API Setup Instructions

This app uses The Movie Database (TMDB) API to fetch real movie data and posters. Follow these steps to set up the API:

## 1. Get a TMDB API Key

1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Create a free account or log in
3. Go to **Settings** → **API**
4. Click **Request an API Key**
5. Fill out the form:
   - **Application Name**: SonyLIV Showcase
   - **Application Summary**: Mobile app for showcasing regional content
   - **Application URL**: (leave blank or use your domain)
6. Accept the terms and submit
7. You'll receive an API key (v3 auth)

## 2. Configure the API Key

1. Open `src/config/api.ts`
2. Replace the placeholder API key with your actual key:

```typescript
export const TMDB_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

## 3. Features Enabled

With the TMDB API configured, you'll get:

- **Real Movie Posters**: High-quality movie posters from TMDB
- **Accurate Movie Data**: Real titles, ratings, release dates, and descriptions
- **Regional Content**: Movies and shows in your preferred languages
- **Search Functionality**: Search through real movie database
- **Genre Filtering**: Filter by actual movie genres
- **Trending Content**: Real trending movies and shows

## 4. API Limits

- **Free Tier**: 1,000 requests per day
- **Rate Limit**: 40 requests per 10 seconds
- **No Authentication Required**: For basic movie data

## 5. Fallback Behavior

If the API key is not configured or requests fail:
- The app will show placeholder images
- Mock data will be used for demonstration
- All functionality remains available

## 6. Testing

To test if the API is working:
1. Open the app
2. Go to the Home page
3. You should see real movie posters instead of colored placeholders
4. Try searching for a movie name
5. Check the browser console for any API errors

## 7. Troubleshooting

**Common Issues:**

1. **No images showing**: Check if your API key is correct
2. **CORS errors**: TMDB API supports CORS, so this shouldn't happen
3. **Rate limiting**: If you hit the rate limit, wait 10 seconds and try again
4. **Invalid API key**: Make sure you copied the key correctly

**Debug Steps:**
1. Check browser console for errors
2. Verify API key in `src/config/api.ts`
3. Test API key directly: `https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY`

## 8. Production Considerations

For production deployment:
- Store API key in environment variables
- Implement proper error handling
- Add request caching to reduce API calls
- Consider upgrading to a paid TMDB plan for higher limits

## 9. Alternative APIs

If TMDB doesn't work for your needs, you can also consider:
- **OMDb API**: For movie information
- **JustWatch API**: For streaming availability
- **IMDb API**: For movie ratings and reviews

---

**Note**: This setup is for demonstration purposes. In a real application, you would want to implement proper API key management, caching, and error handling.
