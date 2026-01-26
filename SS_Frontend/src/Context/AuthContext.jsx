import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [login,setLogin] = useState(null);
  const [token,setToken] = useState(null)
  const [reload, setReload]=useState(false)

  
  useEffect(()=>{


  },[])

  return (
    <AuthContext.Provider value={{ login, setLogin, token, setToken, reload,setReload }}>
      {children}
    </AuthContext.Provider>
  );
}