import { createServerClient } from './server';
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