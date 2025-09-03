import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  organization_id?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'manager' | 'employee';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Connection cache to avoid repeated tests
  const connectionCache = {
    lastTest: 0,
    lastResult: true,
    cacheDuration: 30000, // 30 seconds
  };

  // Test Supabase connection with caching
  const testConnection = async (): Promise<boolean> => {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - connectionCache.lastTest < connectionCache.cacheDuration) {
      console.log('🔧 testConnection: Using cached result:', connectionCache.lastResult);
      return connectionCache.lastResult;
    }
    
    try {
      console.log('🔧 testConnection: Testing Supabase connection...');
      
      // Check auth state first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔧 testConnection: Current session:', session ? 'exists' : 'none', sessionError);
      
      // Simple query to test connection
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('🔧 testConnection: Connection failed:', error);
        connectionCache.lastResult = false;
        connectionCache.lastTest = now;
        return false;
      }
      
      console.log('🔧 testConnection: Connection successful');
      connectionCache.lastResult = true;
      connectionCache.lastTest = now;
      return true;
    } catch (err) {
      console.error('🔧 testConnection: Connection test error:', err);
      connectionCache.lastResult = false;
      connectionCache.lastTest = now;
      return false;
    }
  };

  // Retry wrapper with exponential backoff
  const withRetry = async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<any> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔧 withRetry: Attempt ${attempt}/${maxRetries}`);
        
        // Only test connection on retry attempts (not the first attempt)
        if (attempt > 1) {
          console.log('🔧 withRetry: Testing connection before retry...');
          const isConnected = await testConnection();
          if (!isConnected) {
            throw new Error('Supabase connection failed');
          }
        }
        
        const result = await operation();
        console.log(`🔧 withRetry: Success on attempt ${attempt}`);
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.warn(`🔧 withRetry: Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error(`🔧 withRetry: All ${maxRetries} attempts failed`);
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔧 withRetry: Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };

  // Simple profile fetch function with immediate bypass
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔧 fetchProfile: Fetching profile for user:', userId);
      
      // IMMEDIATE BYPASS: Check localStorage first
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        try {
          const profile = JSON.parse(cachedProfile);
          console.log('🔧 fetchProfile: Using cached profile from localStorage:', profile);
          return profile;
        } catch (e) {
          console.warn('🔧 fetchProfile: Invalid cached profile, removing...');
          localStorage.removeItem(`profile_${userId}`);
        }
      }
      
      // Try to get existing profile with timeout
      console.log('🔧 fetchProfile: Executing Supabase query...');
      console.log('🔧 fetchProfile: Current user object:', user);
      console.log('🔧 fetchProfile: User email:', user?.email);
      
      // Add timeout to the actual Supabase query
      const queryTimeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Supabase query timeout after 3 seconds')), 3000)
      );
      
      const { data: existingProfile, error: fetchError } = await Promise.race([
        supabase
        .from('profiles')
        .select('*')
          .eq('user_id', userId)
          .single(),
        queryTimeout
      ]);

      console.log('🔧 fetchProfile: Supabase query completed:', { existingProfile, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('🔧 fetchProfile: Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        console.log('🔧 fetchProfile: Found existing profile:', existingProfile);
        // Cache the profile for future use
        localStorage.setItem(`profile_${userId}`, JSON.stringify(existingProfile));
        return existingProfile;
      }

      // Profile doesn't exist, create one
      console.log('🔧 fetchProfile: Creating new profile for user:', userId);
      
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
          user_id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          })
          .select()
          .single();

      if (createError) {
        console.error('🔧 fetchProfile: Error creating profile:', createError);
        throw createError;
      }

      console.log('🔧 fetchProfile: New profile created:', newProfile);
      // Cache the new profile
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
      return newProfile;
      
    } catch (err: any) {
      console.error('🔧 fetchProfile: Error:', err);
      
      // FALLBACK: Create a basic profile from user data
      if (err.message.includes('timeout') || err.message.includes('connection')) {
        console.log('🔧 fetchProfile: Creating fallback profile due to timeout/connection issue');
        
        const fallbackProfile: Profile = {
          id: `00000000-0000-0000-0000-${userId.substring(0, 12)}`,
          user_id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          organization_id: '00000000-0000-0000-0000-000000000000',
          role: 'employee',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Cache the fallback profile
        localStorage.setItem(`profile_${userId}`, JSON.stringify(fallbackProfile));
        console.log('🔧 fetchProfile: Fallback profile created and cached');
        return fallbackProfile;
      }
      
      throw err;
    }
  };

  // Simple organization creation if needed
  const ensureOrganization = async (profile: Profile): Promise<Profile> => {
    if (profile.organization_id && !profile.organization_id.startsWith('00000000-0000-0000-0000-000000000000')) {
      console.log('🔧 ensureOrganization: Profile already has organization:', profile.organization_id);
      return profile;
    }

    try {
      console.log('🔧 ensureOrganization: Creating organization for profile');
      
      const orgName = `${profile.full_name || profile.email?.split('@')[0] || 'User'}'s Organization`;
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
          slug: `${orgName.toLowerCase().replace(/\s+/g, '-')}-${profile.user_id.substring(0, 8)}`,
          })
          .select()
          .single();

      if (orgError) {
        console.error('🔧 ensureOrganization: Error creating organization:', orgError);
        throw orgError;
      }

      // Update profile with organization
      const { error: updateError } = await supabase
          .from('profiles')
          .update({ organization_id: orgData.id })
        .eq('id', profile.id);

      if (updateError) {
        console.error('🔧 ensureOrganization: Error updating profile:', updateError);
        throw updateError;
      }

      const updatedProfile = { ...profile, organization_id: orgData.id };
      
      // Update cached profile
      localStorage.setItem(`profile_${profile.user_id}`, JSON.stringify(updatedProfile));
      
      return updatedProfile;
      
    } catch (err: any) {
      console.error('🔧 ensureOrganization: Error creating organization:', err);
      
      // FALLBACK: Use fallback organization
      console.log('🔧 ensureOrganization: Using fallback organization due to error');
      
      // Create a proper UUID format for fallback
      const fallbackOrgId = '00000000-0000-0000-0000-' + profile.user_id.substring(0, 12) + '0000';
      const updatedProfile = { ...profile, organization_id: fallbackOrgId };
      
      // Update cached profile
      localStorage.setItem(`profile_${profile.user_id}`, JSON.stringify(updatedProfile));
      
      return updatedProfile;
    }
  };

  // Clear cached profiles to force fresh load
  const clearCachedProfiles = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('profile_') || key.startsWith('org_')) {
        localStorage.removeItem(key);
        console.log('🧹 Cleared cached profile:', key);
      }
    });
  };

  // Main profile loading function
  const loadUserProfile = async (userId: string) => {
    // Prevent duplicate calls
    if (isProfileLoading) {
      console.log('🔧 loadUserProfile: Already loading profile, skipping duplicate call');
      return;
    }

    // Check if we have a cached profile with invalid organization ID
    const cachedProfile = localStorage.getItem(`profile_${userId}`);
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        if (parsed.organization_id && (
          parsed.organization_id.startsWith('fallback_org') || 
          parsed.organization_id.includes('fallback_') ||
          parsed.organization_id.length !== 36 ||
          !parsed.organization_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        )) {
          console.log('🧹 Detected invalid cached profile, clearing cache');
          clearCachedProfiles();
        }
      } catch (e) {
        // Invalid JSON, clear it
        localStorage.removeItem(`profile_${userId}`);
      }
    }

    // Prevent loading if we already have a profile for this user
    if (profile && profile.user_id === userId) {
      console.log('🔧 loadUserProfile: Profile already exists for this user, skipping');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔧 loadUserProfile: Starting for user:', userId);
      setIsProfileLoading(true);
      setIsLoading(true);
      setError(null);
      
      // Increment attempt counter
      setProfileLoadAttempts(prev => prev + 1);
      
      // Fetch profile
      console.log('🔧 loadUserProfile: Calling fetchProfile...');
      const userProfile = await fetchProfile(userId);
      console.log('🔧 loadUserProfile: fetchProfile result:', userProfile);
      
      if (!userProfile) {
        throw new Error('Failed to fetch or create profile');
      }

      // Ensure organization exists
      console.log('🔧 loadUserProfile: Calling ensureOrganization...');
      const finalProfile = await ensureOrganization(userProfile);
      console.log('🔧 loadUserProfile: ensureOrganization result:', finalProfile);
      
      // Set profile state
      console.log('🔧 loadUserProfile: Setting profile state...');
      setProfile(finalProfile);
      setError(null); // Clear any previous errors
      console.log('🔧 loadUserProfile: Successfully loaded profile:', finalProfile);
      
      // Reset attempts on success
      setProfileLoadAttempts(0);
      
    } catch (err: any) {
      console.error('🔧 loadUserProfile: Error:', err);
      setError(err.message);
      
      // If we've tried too many times, give up and stop loading
      if (profileLoadAttempts >= 3) {
        console.error('🔧 loadUserProfile: Max attempts reached, giving up');
        setError('Failed to load profile after multiple attempts. Please refresh the page.');
      }
    } finally {
      console.log('🔧 loadUserProfile: Finally block reached, setting isLoading to false');
      setIsLoading(false);
      setIsProfileLoading(false);
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // Auth state change handler
  useEffect(() => {
    console.log('🔄 useAuth: Setting up auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuth: Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSession(session);
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSession(null);
          setError(null);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('🔄 useAuth: Found existing session:', session.user.email);
          setUser(session.user);
      setSession(session);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('🔄 useAuth: Error checking session:', error);
      } finally {
      setIsLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  // Debug logging
  console.log('🔄 useAuth: Current state:', { 
    user: !!user, 
    profile: !!profile, 
    isLoading, 
    error: !!error,
    organization_id: profile?.organization_id 
  });

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) throw new Error('No profile to update');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      
      if (error) throw error;
      
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      localStorage.setItem(`profile_${profile.user_id}`, JSON.stringify(updatedProfile));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Expose cache clearing function for debugging
  (window as any).clearChatCache = clearCachedProfiles;
  (window as any).clearCachedProfiles = clearCachedProfiles;

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}