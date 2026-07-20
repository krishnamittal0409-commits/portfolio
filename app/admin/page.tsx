"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_EMAIL = "krishnamittal0409@gmail.com";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        return;
      }

      // Optional: record every login attempt
      await supabase.from("login_attempts").insert({
        email: user.email,
      });

      setAuthorized(
        user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
    };

    check();
  }, []);

  if (authorized === null) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div>
          <h1>Access Denied</h1>
          <p>You are not authorized to access this admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Your admin dashboard */}
    </div>
  );
}