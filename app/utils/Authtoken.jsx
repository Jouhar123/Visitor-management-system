"use client";

import { jwtDecode } from "jwt-decode";

// --- Token helpers ---

function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // seconds

    // if exp is missing OR already expired
    if (!decoded.exp || decoded.exp <= currentTime) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export function getAuthToken() {
  return (
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    null
  );
}

export function clearAuthToken() {
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
}

export function checkAuth() {
  const token = getAuthToken();

  if (!token) {
    clearAuthToken();
    return { valid: false, token: null };
  }

  if (!isTokenValid(token)) {
    clearAuthToken();
    return { valid: false, token: null };
  }

  return { valid: true, token };
}

// --- API validation helper ---

export async function validateUserSession() {
  const { valid, token } = checkAuth();

  if (!valid || !token) {
    return { valid: false, user: null };
  }

  try {
    const response = await fetch("/api/auth/validate", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearAuthToken();
      return { valid: false, user: null };
    }

    const data = await response.json();
    return { valid: true, user: data.user };
  } catch (err) {
    console.error("Session validation error:", err);
    clearAuthToken();
    return { valid: false, user: null };
  }
}









// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {jwtDecode} from "jwt-decode";

// export default function Authapi({ children }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");

//     if (!token) {
//       router.push("/signin");
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       const currentTime = Date.now() / 1000;

//       if (decoded.exp && decoded.exp < currentTime) {
//         // Token expired
//         localStorage.removeItem("authToken");
//         router.push("/signin");
//         return;
//       }

//       // Token looks fine → let the user in
//       setLoading(false);
//     } catch (err) {
//       console.error("Invalid token:", err);
//       localStorage.removeItem("token");
//       router.push("/signin");
//     }
//   }, [router]);

//   if (loading) {
//     return <p className="text-center">Checking authentication...</p>;
//   }

//   return <>{children}</>;
// }
