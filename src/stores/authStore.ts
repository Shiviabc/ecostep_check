import { create } from 'zustand';
import supabase from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string) => Promise<{ error: any, user: any }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      set({ user, isLoading: false });
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ user: null, isLoading: false });
    }
  },
  
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error && data.user) {
        set({ user: data.user });
      }
      
      return { error };
    } catch (error) {
      console.error('Login error:', error);
      return { error };
    }
  },
  
  register: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            email_confirmed: true
          }
        }
      });
      
      if (!error && data.user) {
        // Create profile immediately after registration
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: email.split('@')[0],
            total_carbon_saved: 0,
            level: 1,
          });
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError, user: null };
        }
        
        // Set the user in state immediately
        set({ user: data.user });
      }
      
      return { error, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { error, user: null };
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));