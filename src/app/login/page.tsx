
"use client";

import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore } from '@/firebase';
import { CustomCard } from '@/components/custom/CustomCard';
import { InputField } from '@/components/custom/InputField';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address in the field above to reset your password.",
        variant: "destructive",
      });
      return;
    }
    if (!auth) {
        toast({ title: "Error", description: "Authentication service is not available.", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let description = "Could not send reset email. Please check the address and try again.";
      if (error.code === 'auth/user-not-found') {
        description = "No account found with this email address.";
      }
      toast({
        title: "Password Reset Failed",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        toast({
            title: "Missing Information",
            description: "Please enter both email and password.",
            variant: "destructive",
        });
        return;
    }

    if (isSignUp && password !== confirmPassword) {
        toast({
            title: "Passwords Do Not Match",
            description: "Please ensure your passwords match.",
            variant: "destructive",
        });
        return;
    }
    
    if (!auth || !db) {
        toast({ title: "Error", description: "Firebase service is not available.", variant: "destructive" });
        return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create a new document in the 'users' collection with the user's UID
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.email?.split('@')[0] || 'New User', // Create a default display name
          createdAt: serverTimestamp(), // Use Firestore's server-side timestamp
          handicap: null, // Placeholder for future use
        });

        toast({
            title: "Account Created",
            description: "Welcome! You have been signed in.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Success",
          description: "Welcome back!",
        });
      }
      // AuthProvider will handle the state change and redirect for both.
    } catch (error: any) {
      console.error("Auth error:", error);
      let description = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = "Invalid email or password. Please check your credentials and try again, or sign up if you don't have an account.";
          break;
        case 'auth/invalid-email':
          description = "The email address is not valid.";
          break;
        case 'auth/user-disabled':
          description = "This user account has been disabled.";
          break;
        case 'auth/email-already-in-use':
          description = "This email is already registered. Please try signing in instead.";
          break;
        case 'auth/weak-password':
          description = "The password is too weak. Please use a stronger password (at least 6 characters).";
          break;
        default:
          description = "An error occurred during authentication. Please try again.";
      }
      toast({
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
      setIsSignUp(!isSignUp);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <CustomCard className="max-w-md w-full">
        <div className="text-center mb-2">
          <h1 className="font-pacifico text-4xl text-foreground">Potentially</h1>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">
          {isSignUp ? "Create an Account" : "Sign In"}
        </h2>
        <form onSubmit={handleAuthAction}>
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignUp && (
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <Button
            type="submit"
            className="w-full mt-4 hover:bg-black hover:text-primary"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
        </form>
         <Button
            variant="link"
            onClick={toggleAuthMode}
            className="w-full mt-4 text-sm text-foreground"
        >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Button>
        {!isSignUp && (
          <div className="text-center -mt-2">
            <Button
              variant="link"
              onClick={handlePasswordReset}
              className="text-sm text-muted-foreground"
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </div>
        )}
      </CustomCard>
    </div>
  );
}
