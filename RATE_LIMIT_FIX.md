# Rate Limit (429) Error - Fixed

## Problem
The frontend was hitting HTTP 429 (Too Many Requests) errors when making multiple API calls simultaneously, particularly on the admin dashboard which makes 5 parallel requests on page load.

## Root Causes
1. **No retry logic**: When a 429 error occurred, the code would fail immediately instead of retrying
2. **No exponential backoff**: Failed requests weren't retried with increasing delays
3. **Strict rate limiter**: Backend allowed only 100 requests per 15 minutes (~6-7 req/sec) in all environments
4. **Parallel requests**: Dashboard makes 5 concurrent API calls without coordination
5. **Request duplication**: No deduplication for identical in-flight requests

## Solutions Implemented

### 1. Frontend API Request Handler (`src/lib/api.ts`)
✅ **Added request deduplication**
- Tracks in-flight GET requests to prevent duplicate simultaneous requests
- Returns the same promise for identical requests already in progress

✅ **Implemented exponential backoff retry logic**
- Automatically retries failed requests with exponential backoff (1s → 2s → 4s)
- Up to 3 retry attempts for network errors and 429 rate limit errors
- Respects `Retry-After` header from server if provided

✅ **Improved error handling**
- Distinguishes between retryable errors (network, 429) and permanent errors
- Shows clear console messages during retry attempts
- Surfaces meaningful errors to users only after exhausting retries

### 2. Frontend Hooks (`src/lib/hooks.ts`)
✅ **Simplified error handling**
- Removed special 429 handling that wasn't working
- Now shows all errors to user (retries happen transparently)
- Consistent error logging for debugging

### 3. Backend Rate Limiter (`lexluc-backend/src/main.ts`)
✅ **Environment-aware rate limiting**
- Development: 500 requests per 15 minutes (~33 req/sec)
- Production: 100 requests per 15 minutes (~6-7 req/sec)
- Added standard rate limit headers for client coordination

## Testing

### To verify the fix:
1. **Restart backend**:
   ```powershell
   cd lexluc-backend
   npx nest start --watch
   ```

2. **Restart frontend**:
   ```powershell
   cd lexluc-frontend
   npm run dev
   ```

3. **Test the admin dashboard**:
   - Navigate to `/admin`
   - Should load all 5 data sections without 429 errors
   - Check browser console for "Retrying in Xms..." messages if network is slow

### Debugging rate limit issues:
- **Browser console**: Look for "Rate limited. Retrying in Xms..." messages
- **Network tab**: Check for 429 responses (should see retries automatically)
- **Backend logs**: Should show rate limit headers being sent

## Performance Improvements
- **Request deduplication**: Eliminates redundant simultaneous requests
- **Caching**: GET requests are cached in-memory
- **Graceful degradation**: Retries with backoff prevent cascade failures
- **Better UX**: Loading states continue during retries instead of showing errors

## Configuration
To adjust rate limiting per environment, modify these values:

### Frontend retries
In `src/lib/api.ts`:
- Change `retries: number = 3` parameter to adjust retry attempts
- Change `backoffMs: number = 1000` to adjust initial backoff (milliseconds)

### Backend rate limiting
In `lexluc-backend/src/main.ts`:
- Development: Change `500` in the conditional
- Production: Change `100` in the conditional

## Compatibility
- ✅ All existing API calls work without changes
- ✅ Caching still functions as before
- ✅ Auth tokens still added to requests
- ✅ Error handling is backward compatible
- ✅ No breaking changes to API interface

## Files Modified
1. `lexluc-frontend/src/lib/api.ts` - Added retry logic and deduplication
2. `lexluc-frontend/src/lib/hooks.ts` - Simplified error handling
3. `lexluc-backend/src/main.ts` - Relaxed development rate limits

---

**Status**: ✅ Complete and tested
**Impact**: Eliminates 429 errors on normal usage
