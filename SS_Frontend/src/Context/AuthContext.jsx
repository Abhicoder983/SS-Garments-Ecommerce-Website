import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [login,setLogin] = useState(false);
  const [token,setToken] = useState(null)

  
  useEffect(()=>{


  },[])

  return (
    <AuthContext.Provider value={{ login, setLogin, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}