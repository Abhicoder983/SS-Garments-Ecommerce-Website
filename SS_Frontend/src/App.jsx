import Home from "./components/Home";
import UserLogin from "./components/UserLogin";
import Account from "./components/Account";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

function App() {
  return (
    <>
  <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Account />} />
     
    </Routes>
    </>
  );
    
}

export default App
