"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateUserSession } from "./Authtoken"; // import your helper

export default function Authapi({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { valid } = await validateUserSession();

      if (!valid) {
        router.push("/signin");
      } else {
        setIsValid(true);
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  if (loading) {
    return <p className="text-center mt-10">Checking session...</p>;
  }

  if (!isValid) {
    return null; // redirect will happen
  }

  return <>{children}</>;
}
