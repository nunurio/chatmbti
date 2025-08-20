import { createServerClient } from './server';
import { createBrowserClient } from './client';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Get the current session for the authenticated user
 * @returns Session object or null if not authenticated
 * @throws Error if authentication fails
 */
export async function getSession(): Promise<Session | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Session retrieval failed: ${error.message}`);
    }
    
    return data.session;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while getting session');
  }
}

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 * @throws Error if authentication fails
 */
export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`User retrieval failed: ${error.message}`);
    }
    
    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while getting user');
  }
}

/**
 * Sign out the current user
 * @throws Error if sign out fails
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during sign out');
  }
}

/**
 * Get user's saved locale preference
 * @param userId - User ID to get locale for
 * @returns User's locale preference or null if not found
 * @throws Error if database query fails
 */
export async function getUserLocale(userId: string): Promise<string | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('locale')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to get user locale: ${error.message}`);
    }
    
    return data?.locale || null;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while getting user locale');
  }
}

/**
 * Update user's locale preference (client-side)
 * @param locale - The locale to set ('ja' | 'en')
 * @returns Promise that resolves when update is complete
 * @throws Error if update fails
 */
export async function updateUserLocale(locale: 'ja' | 'en'): Promise<void> {
  try {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ locale })
      .eq('id', user.id);
    
    if (error) {
      throw new Error(`Failed to update user locale: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while updating user locale');
  }
}

/**
 * Set default locale for new user registration (server-side)
 * @param userId - The user ID to set locale for
 * @param locale - The default locale ('ja' | 'en')
 * @throws Error if update fails
 */
export async function setDefaultUserLocale(userId: string, locale: 'ja' | 'en' = 'ja'): Promise<void> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('profiles')
      .update({ locale })
      .eq('id', userId);
    
    if (error) {
      throw new Error(`Failed to set default user locale: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while setting default user locale');
  }
}