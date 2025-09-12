// // utils/fetchWithAuth.js
// export async function fetchWithAuth(url, options = {}) {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     throw new Error("No authentication token found");
//   }

//   const res = await fetch(url, {
//     ...options,
//     headers: {
//       ...options.headers,
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (res.status === 401) {
//     // Token rejected by server
//     localStorage.removeItem("token");
//     window.location.href = "/signin"; // redirect to login
//     throw new Error("Unauthorized");
//   }

//   return res.json();
// }
