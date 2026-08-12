import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "./NavBar";
import Footer from "./Footer";
import {
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Check,
  ShoppingBag,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;


const STEPS = ["Bag", "Review & pay", "Confirmed"];

const currency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { login, setLogin, token, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  /* 🔹 Fetch cart from backend (cookie based) */
  useEffect(() => {
    if (!login || !token) {
      setLogin(null);
      setToken(null);
    }
    fetchCart();
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${apiUrl}/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
        withXSRFToken: true,
      });
      setCartItems(res.data.cart_Detail || []);
      setLogin(res.data.userData);
      setToken(res.data.access_Token);
    } catch (err) {
      setToken(null);
      setLogin(null);
      setCartItems(null);
      navigate("/login");
      toast.error(err.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 Update quantity */
  const updateQty = async (product_id, qty) => {
    if (qty < 1) return;

    await axios
      .patch(
        `${apiUrl}/cart/`,
        { product_id, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          xsrfCookieName: 'csrftoken',
          xsrfHeaderName: 'X-CSRFToken',
          withXSRFToken: true,
        }
      )
      .then((res) => {
        setLogin(res.data.userData);
        setToken(res.data.access_Token);
      })
      .catch((err) => {
        setLogin(null);
        setToken(null);
        toast.err(err?.response?.data?.error);
        navigate("/login");
      });

    fetchCart();
  };

  /* 🔹 Remove item */
  const removeItem = async (product_id) => {
    await axios
      .delete(`${apiUrl}/cart/`, {
        data: { product_id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
        withXSRFToken: true,
      })
      .then((res) => {
        setLogin(res.data.userData);
        setToken(res.data.access_Token);
      })
      .catch((err) => {
        setLogin(null);
        setToken(null);
        toast.err(err?.response?.data?.error);
        navigate("/login");
      });

    fetchCart();
  };

  /* 🔹 Calculations */
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  /* 🔹 Send the current cart items to the BuyNow page */
  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) return;
    navigate("/buynow", { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="bg-[#FAF6EF] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 text-sm text-[#8A7F73]">
          Loading your bag…
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF6EF] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-16">
        {/* Stepper */}
        <div className="flex items-center mb-9 max-w-md">
          {STEPS.map((label, i) => {
            const isActive = i === 0;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                    style={{
                      backgroundColor: isActive ? "#4A0E1C" : "transparent",
                      color: isActive ? "#FFFDF9" : "#B0A48F",
                      border: isActive ? "none" : "1.5px solid #DCD0B8",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="text-xs whitespace-nowrap"
                    style={{ color: isActive ? "#2B2422" : "#B0A48F", fontWeight: isActive ? 600 : 400 }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[#DCD0B8] mx-3 min-w-[24px]" />}
              </div>
            );
          })}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-[28px] sm:text-[32px] leading-tight text-[#2B2422]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Your bag
          </h1>
          <p className="text-sm text-[#8A7F73] mt-1.5">
            {cartItems.length === 0
              ? "Nothing here yet"
              : `${totalItems} ${totalItems === 1 ? "item" : "items"} ready for checkout`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE3D3] py-20 flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-[#FBF3E0] flex items-center justify-center mb-4">
              <ShoppingBag size={20} className="text-[#B8862E]" />
            </div>
            <p className="text-[#2B2422] font-medium mb-1.5">Your bag is empty</p>
            <p className="text-sm text-[#8A7F73] mb-6">
              Browse the collection and add something you like.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4A0E1C] text-[#FFFDF9] text-sm font-semibold"
            >
              Continue shopping
              <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Left column — items */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#EDE3D3] p-5 sm:p-6">
                <h2 className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-5">
                  Items in your bag
                </h2>

                <div className="divide-y divide-[#F3EDE0]">
                  {cartItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-start sm:items-center gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-[72px] h-[88px] rounded-xl object-cover shrink-0 border border-[#EDE3D3]"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14.5px] font-medium text-[#2B2422] leading-snug">
                          {item.product_name}
                        </h3>
                        <p className="text-xs text-[#9C9082] mt-1.5">Size {item.size}</p>
                        <p className="text-sm font-semibold text-[#4A0E1C] mt-2">
                          {currency(item.price * item.qty)}
                          <span className="text-xs font-normal text-[#B0A48F] ml-1.5">
                            ({currency(item.price)} each)
                          </span>
                        </p>

                        <div className="flex items-center justify-between mt-3.5">
                          <div className="flex items-center border border-[#EDE3D3] rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQty(item.product_id, item.qty - 1)}
                              className="w-7 h-7 flex items-center justify-center text-[#4A0E1C] hover:bg-[#FBF3E0] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-sm text-[#2B2422]">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.product_id, item.qty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-[#4A0E1C] hover:bg-[#FBF3E0] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="flex items-center gap-1 text-xs font-medium text-[#B24444] hover:text-[#8F2F2F] transition-colors"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: ShieldCheck, label: "Secure payments" },
                  { icon: RotateCcw, label: "7-day easy returns" },
                  { icon: Truck, label: "Tracked delivery" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="bg-white border border-[#EDE3D3] rounded-xl px-3 py-3.5 flex flex-col items-center text-center gap-1.5"
                  >
                    <Icon size={17} className="text-[#B8862E]" />
                    <span className="text-[11px] text-[#8A7F73] leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — summary */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-[#EDE3D3] p-6">
                <h2 className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-5">
                  Order summary
                </h2>

                <div className="space-y-3 text-sm text-[#4A413A]">
                  <div className="flex justify-between">
                    <span>
                      Subtotal <span className="text-[#B0A48F]">({totalItems} items)</span>
                    </span>
                    <span>{currency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck size={13} className="text-[#9C9082]" />
                      Shipping
                    </span>
                    <span>{currency(shipping)}</span>
                  </div>
                </div>

                <div className="h-px bg-[#F0E9DD] my-5" />

                <div className="flex justify-between items-baseline mb-6">
                  <span
                    className="text-base text-[#2B2422]"
                    style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                  >
                    Total
                  </span>
                  <span
                    className="text-2xl text-[#4A0E1C]"
                    style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                  >
                    {currency(total)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-xl bg-[#4A0E1C] text-[#FFFDF9] text-sm font-semibold tracking-wide hover:bg-[#3A0B16] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  Proceed to checkout
                  <ChevronRight size={16} />
                </button>

                <p className="text-[11px] text-[#B0A48F] text-center mt-4">
                  A discount may apply at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer className="max-w-screen" />
    </div>
  );
}
