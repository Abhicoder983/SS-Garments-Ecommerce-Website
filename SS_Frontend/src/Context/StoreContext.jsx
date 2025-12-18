import { createContext, useState } from "react";

export const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [openMenu, setOpenMenu] = useState(0);

  return (
    <StoreContext.Provider value={{ openMenu, setOpenMenu }}>
      {children}
    </StoreContext.Provider>
  );
}