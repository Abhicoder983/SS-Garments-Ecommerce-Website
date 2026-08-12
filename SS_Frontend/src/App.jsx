import Home from "./components/Home";
import UserLogin from "./components/UserLogin";
import Account from "./components/Account";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartPage from "./components/Cart";
import ContactUs from "./components/ContactUs";
import AboutUs from "./components/AboutUs"
import ProductDetail from "./components/ProductDetail";
import SearchResults from "./components/SearchResult"
import Buynow from "./components/Buynow";
import GoogleSignInDropdown from "./components/auth/GoogleSignInButton.jsx"
import PolicyPage from './components/PolicyPage';
import TermsAndConditions from "./components/TermsAndConditions";
import PaymentCheckout from "./components/PaymentCheckout.jsx";

function App() {
  return (
    <>
    <ToastContainer />

    <GoogleSignInDropdown />

  <Routes>
      <Route path="/returns" element={<PolicyPage slug="returns" />} />
      <Route path="/delivery" element={<PolicyPage slug="delivery" />} />
      <Route path="/refunds" element={<PolicyPage slug="refunds" />} />
      <Route path="/privacy" element={<PolicyPage slug="privacy" />} />
      <Route path="/shipping" element={<PolicyPage slug="shipping" />} />
      <Route path="/cancellation" element={<PolicyPage slug="cancellation" />} />
      <Route path= "/terms" element = {<TermsAndConditions />}/>
      <Route path = '/payment-flow' element = {<PaymentCheckout />}/>
      <Route path="/" element={<Home />} />
      <Route path="/account" element={<Account />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/cart" element={<CartPage />}/>
      <Route path="/buynow" element={<Buynow />} />
      <Route path="/checkout" element={<ProductDetail />} />
      <Route path="/products" element={< SearchResults />}/>
      <Route path="/contactus" element={< ContactUs />}/>
      <Route path="/aboutus" element={< AboutUs />}/>


    </Routes>
    </>
  );
    
}

export default App
