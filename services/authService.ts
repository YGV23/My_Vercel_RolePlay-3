import { supabase } from './supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
}

export const authService = {
  async signUp(email: string, password: string): Promise<{ user: AuthUser; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        return { user: null as any, error: error.message };
      }

      if (!data.user) {
        return { user: null as any, error: 'Failed to create user' };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: email.trim()
        });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
      }

      // Create default user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: data.user.id,
          settings_data: {}
        });

      if (settingsError) {
        console.error('Failed to create settings:', settingsError);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email || email
        },
        error: null
      };
    } catch (error: any) {
      return { user: null as any, error: error.message || 'Sign up failed' };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        return { user: null as any, error: error.message };
      }

      if (!data.user) {
        return { user: null as any, error: 'Failed to sign in' };
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email || email
        },
        error: null
      };
    } catch (error: any) {
      return { user: null as any, error: error.message || 'Sign in failed' };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Sign out failed' };
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        return null;
      }
      return {
        id: data.session.user.id,
        email: data.session.user.email || ''
      };
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || ''
        });
      } else {
        callback(null);
      }
    });

    return subscription;
  }
};
