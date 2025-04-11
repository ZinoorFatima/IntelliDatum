"use client"; 

import { useState, useEffect, useContext, createContext } from "react";

const authContext = createContext();

const AuthProvider = ({ children }) => {
  console.log("AuthProvider rendered");

  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  useEffect(() => {
    console.log("Checking localStorage for auth data");

    if (typeof window !== "undefined") {
      const data = localStorage.getItem("auth");
      console.log("local data:" , data)
      if (data) {
        const parsedData = JSON.parse(data);
        setAuth({
          user: parsedData.user,
          token: parsedData.token,
        });
      }
    }
  }, []); // Run only once on mount

  return (
    <authContext.Provider value={[auth, setAuth]}>
      {children}
    </authContext.Provider>
  );
};

export const getAuthUserId = async (req) => {
  try {
      const { user } = req.auth;  // Assuming the user information is attached to the request, like from middleware
      return user ? user.id : null;
  } catch (error) {
      console.error("Error extracting user ID:", error);
      return null;
  }
};

// Custom Hook for easy usage
const useAuth = () => useContext(authContext);

export { useAuth, AuthProvider };
