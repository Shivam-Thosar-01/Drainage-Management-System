
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing login when the application starts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    setUser(response.data.user);
    return response.data;
  };

  // Logout function
  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);






// import { createContext, useState } from "react";
// import API from "../api/axios";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {

//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(false);

//     // Register
//     const register = async (formData) => {
//         try {
//             setLoading(true);

//             const response = await API.post(
//                 "/auth/register",
//                 formData
//             );

//             setUser(response.data.user);

//             return response.data;

//         } finally {
//             setLoading(false);
//         }
//     };

//     // Login
//     const login = async (formData) => {
//         try {
//             setLoading(true);

//             const response = await API.post(
//                 "/auth/login",
//                 formData
//             );

//             setUser(response.data.user);

//             return response.data;

//         } finally {
//             setLoading(false);
//         }
//     };

//     // Logout
//     const logout = async () => {
//         try {
//             await API.post("/auth/logout");
//         } finally {
//             setUser(null);
//         }
//     };

//     return (
//         <AuthContext.Provider
//             value={{
//                 user,
//                 setUser,
//                 loading,
//                 register,
//                 login,
//                 logout
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };
