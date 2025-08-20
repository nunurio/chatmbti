# Authentication System Implementation Analysis

## Timeline Log
- 14:15 - Created scratchpad for authentication system implementation task
- 14:20 - Started task analysis by reading task specifications from `.kiro/specs/mbti-chatbot-system/tasks.md`
- 14:21 - Analyzed authentication design patterns from `.kiro/specs/mbti-chatbot-system/design.md`
- 14:22 - Reviewed database schema in `supabase/schemas/02-users.sql` - confirmed profiles and user_roles tables
- 14:23 - Verified existing project structure - no auth components exist yet
- 14:24 - Confirmed required packages installed: @supabase/ssr, @supabase/supabase-js
- 14:25 - Reviewed RLS policies in `06-rls-policies.sql` for secure data access patterns
- 14:26 - Analyzed requirements 1.1-1.6 for Magic Link auth flow and profile management

## Implementation Plan (Detailed)

### Phase 1: Supabase Client Setup
1. **Create `/src/lib/supabase/client.ts`**
   - Browser client factory for client components
   - Server client factory for server components
   - Middleware client for auth state management

2. **Create `/src/lib/supabase/auth.ts`**
   - Auth helper functions
   - Session management utilities
   - User profile helpers

### Phase 2: Authentication Provider
3. **Create `/src/components/auth/AuthProvider.tsx`**
   - Client component for auth state management
   - Subscribe to auth state changes
   - Provide auth context to children
   - Handle token refresh automatically

### Phase 3: Authentication UI
4. **Create `/src/app/(auth)/login/page.tsx`**
   - Magic Link login form
   - Email input and validation
   - Success/error messaging
   - Redirect to profile setup after login

5. **Create `/src/app/(auth)/signup/page.tsx`**
   - Magic Link signup form
   - Similar to login but different messaging
   - Auto-redirect to MBTI profile setup

6. **Create `/src/components/auth/LoginForm.tsx`**
   - Reusable form component for login/signup
   - Email validation
   - Loading states
   - Error handling

### Phase 4: Profile Management
7. **Create `/src/app/(auth)/profile/page.tsx`**
   - MBTI type selection UI
   - Handle "unknown" → redirect to diagnosis
   - Save profile to database
   - Display current MBTI type

8. **Create `/src/app/api/auth/profile/route.ts`**
   - GET: Fetch user profile
   - POST: Create profile (after first login)
   - PATCH: Update profile (MBTI type change)
   - Use service role for server-side operations

### Phase 5: Route Protection
9. **Create `/src/components/auth/ProtectedRoute.tsx`**
   - Check authentication status
   - Redirect to login if not authenticated
   - Check profile completion
   - Redirect to profile setup if incomplete

10. **Update `/src/app/layout.tsx`**
    - Wrap app with AuthProvider
    - Handle auth state hydration
    - Set up auth event listeners

### Phase 6: Testing
11. **Create test files**
    - `/tests/unit/lib/supabase/auth.test.ts`
    - `/tests/unit/components/auth/AuthProvider.test.tsx`
    - `/tests/unit/components/auth/LoginForm.test.tsx`
    - `/tests/integration/api/auth.route.test.ts`

## Files to Create/Modify

### New Files (Priority Order)
1. `/src/lib/supabase/client.ts` - Supabase client configuration
2. `/src/lib/supabase/auth.ts` - Auth helper functions
3. `/src/components/auth/AuthProvider.tsx` - Auth state management
4. `/src/components/auth/LoginForm.tsx` - Reusable login/signup form
5. `/src/app/(auth)/login/page.tsx` - Login page
6. `/src/app/(auth)/signup/page.tsx` - Signup page
7. `/src/app/(auth)/profile/page.tsx` - Profile setup page
8. `/src/components/auth/ProtectedRoute.tsx` - Route protection
9. `/src/app/api/auth/profile/route.ts` - Profile API endpoints
10. `/src/app/api/auth/route.ts` - Auth helper endpoints (optional)

### Files to Modify
1. `/src/app/layout.tsx` - Add AuthProvider wrapper
2. `/src/app/page.tsx` - Add authentication check and redirect

## Technical Implementation Details

### Supabase Client Configuration
- Use `@supabase/ssr` for server-side auth
- Configure cookie options for auth persistence
- Set up PKCE flow for enhanced security
- Use asymmetric JWT validation

### Magic Link Flow
1. User enters email
2. Call `supabase.auth.signInWithOtp({ email })`
3. Show success message
4. User clicks link in email
5. Supabase handles verification
6. Redirect to profile setup or dashboard

### RLS Policies (Already Configured)
- `profiles_select_owner_or_public`: Users can see own profile or public profiles
- `profiles_update_owner`: Users can only update own profile
- `profiles_insert_self`: Users can only insert own profile
- `profiles_admin_select_all`: Admins can see all profiles

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` ✓ (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓ (already set)
- `SUPABASE_SERVICE_ROLE_KEY` (needed for server-side operations)

## Decisions & Rationale

1. **Using @supabase/ssr over @supabase/auth-helpers-nextjs**
   - More control over cookie handling
   - Better support for Next.js 15 App Router
   - Aligned with latest Supabase recommendations

2. **Magic Link over Password**
   - Simpler UX for MVP
   - No password management needed
   - More secure (no password to leak)
   - Aligns with design specification

3. **Separate login/signup pages**
   - Clearer user intent
   - Different messaging strategies
   - Better analytics tracking
   - Simpler error handling

4. **Profile API as separate endpoint**
   - Separation of concerns
   - Easier to test
   - Can add validation/business logic
   - Future-proof for additional profile features

## Open Questions

1. **Service Role Key**: Need to add `SUPABASE_SERVICE_ROLE_KEY` to environment variables for server-side operations
2. **Email Templates**: Should we customize Supabase email templates for Magic Link?
3. **OAuth Providers**: Design mentions OAuth - should we add Google/GitHub auth in this phase?
4. **Session Duration**: What should be the session timeout? Default is 1 week
5. **Profile Validation**: Should we validate MBTI type format on the server side?

## Risk Mitigation

1. **Security**: All database operations use RLS policies
2. **Performance**: Use React.lazy for auth components
3. **Error Handling**: Comprehensive try-catch blocks with user-friendly messages
4. **Testing**: TDD approach with full test coverage
5. **Migration**: No existing auth system, so no migration needed