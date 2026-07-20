"use client";

import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 rounded-lg bg-white text-black font-semibold"
      >
        Continue with Google
      </button>
    </div>
  );
}