// src/hooks/useAuth.ts
// Auth state + sign-in/sign-out. Thin re-export so existing call sites keep
// importing from here; the state itself lives in <AuthProvider>.
//
// Usage:
//   const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
//   if (loading) return <Spinner />;
//   if (!user) return <SignInPrompt />;
//   return <Welcome name={profile?.display_name} />;

export { useAuthContext as useAuth, type AuthState, type Profile } from '@/auth/AuthProvider';
