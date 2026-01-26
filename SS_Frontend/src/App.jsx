import Home from "./components/Home";
import UserLogin from "./components/UserLogin";
import Account from "./components/Account";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import CartPage from "./components/Cart";
import ProductDetail from "./components/ProductDetail";
import SearchResults from "./components/SearchResult"
import Buynow from "./components/Buynow";

function App() {
  return (
    <>
    <ToastContainer />
  <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/account" element={<Account />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/cart" element={<CartPage />}/>
      <Route path="/buynow" element={<Buynow />} />
      <Route path="/checkout" element={<ProductDetail />} />
      <Route path="/products" element={< SearchResults />}/>
    </Routes>
    </>
  );
    
}

export default App
