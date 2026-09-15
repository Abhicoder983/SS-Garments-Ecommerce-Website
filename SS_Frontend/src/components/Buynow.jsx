import { useContext, useEffect, useMemo, useState,useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NavBar from "./NavBar";
import Footer from "./Footer";
import AddressPage from "./inPages/AddressPage";
import edit from "../assets/Buynow/edit.png";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Lock,
  ChevronRight,
  MapPin,
  Check,
  Sparkles,
  X,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const DISCOUNT_RATE = 0.1;
const STEPS = ["Bag", "Review & pay", "Confirmed"];

const currency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function Buynow() {
  const { login, setLogin, token, setToken } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  /* 🔹 Two ways to land on this page:
     1. From the cart — location.state.cartItems (array)
     2. From a product page's "Buy now" — location.state.product/variant/selectedSize (single item) */
  const cartItems = location.state?.cartItems;
  const product = location.state?.product;
  const variant = location.state?.variant;
  const selectedSize = location.state?.selectedSize;

  const items = useMemo(() => {
    if (cartItems && cartItems.length) {
      return cartItems.map((i) => ({
        product_id: i.product_id,
        name: i.product_name,
        image: i.image,
        size: i.size,
        color: i.color,
        price: i.price,
        qty: i.qty,
      }));
    }
    if (product) {
      const v = product?.variants?.[variant];
      const sizeObj = v?.sizes?.[selectedSize];
      console.log('abhishek',sizeObj)
      return [
        {
          product_id:sizeObj?.size_id,
          name: product?.product_name,
          image: v?.image,
          size: sizeObj?.size,
          color: v?.color,
          price: sizeObj?.price,
          qty: 1,
        },
      ];
    }
    return [];
  }, [cartItems, product, variant, selectedSize]);

  const [editProfile, setEditProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectionPage, setSelectionPage] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  /* ── Coupon state ── */
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem("buynow_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!login && !token) {
      setLogin(null);
      setToken(null);
    }
  }, [login, token]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // 🔹 Load Razorpay checkout script once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // 🔹 Persist applied coupon so UI matches backend session after refresh
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("buynow_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("buynow_coupon");
    }
  }, [appliedCoupon]);

const safetyTimerRef = useRef(null);
const rzpInstanceRef = useRef(null);

// clears the timer + closes any open Razorpay modal on unmount
useEffect(() => {
  return () => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (rzpInstanceRef.current) {
      try {
        rzpInstanceRef.current.close();
      } catch {
        /* already closed */
      }
    }
  };
}, []);

  /* ── 🆕 Clear coupon on unmount (navigate away / refresh) ── */
  useEffect(() => {
    return () => {
      // 1. Wipe localStorage so next mount starts fresh
      localStorage.removeItem("buynow_coupon");

      // 2. Tell backend to drop the session coupon as well
      //    Fire-and-forget: we don't block unmount on this call
      if (token) {
        axios
          .post(
            `${apiUrl}/remove-coupon/`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
              xsrfCookieName: "csrftoken",
              xsrfHeaderName: "X-CSRFToken",
              withXSRFToken: true,
            }
          )
          .catch(() => {
            /* silent fail — not worth blocking navigation */
          });
      }
    };
  }, [token, apiUrl]);

  const handleProfileSave = async () => {
    if (!profileName.trim()) {
      toast.error("Name is required to save");
      return;
    }
    const formData = new FormData();
    if (profileName !== "") formData.append("name", profileName);

    try {
      const res = await axios.patch(`${apiUrl}/account/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
        withXSRFToken: true,
      });
      setLogin(res.data.userData);
      setToken(res.data.access_Token);
      toast("Profile updated");
      setEditProfile(false);
    } catch {
      setLogin(null);
      setToken(null);
      toast.error("Update failed, please try logging in again");
      setEditProfile(false);
      navigate("/login");
    }
  };

  const uploadSetAddress = async (updated) => {
    try {
      const res = await axios.patch(
        `${apiUrl}/account/`,
        { address: updated },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          xsrfCookieName: 'csrftoken',
          xsrfHeaderName: 'X-CSRFToken',
          withXSRFToken: true,
        }
      );
      setLogin(res.data.userData);
      setToken(res.data.access_Token);
      toast.success("Address updated");
    } catch {
      setLogin(null);
      setToken(null);
      toast.error("Address update failed");
      navigate("/login");
    }
  };

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (i.price || 0) * i.qty, 0),
    [items]
  );

  /* ── Pricing (default 10 % + optional coupon) ── */
  const defaultDiscount = Math.round(subtotal * DISCOUNT_RATE);
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  const shipping = subtotal > 0 ? 99 : 0;
  const total = Math.max(0, subtotal - defaultDiscount - couponDiscount + shipping);

  const address = login?.address?.[selectedAddress];
  const mobile_no = login?.mobile_no;

  /* ── Coupon handlers ── */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/apply-coupon/`,
        { code: couponCode.trim(), subtotal },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          xsrfCookieName: "csrftoken",
          xsrfHeaderName: "X-CSRFToken",
          withXSRFToken: true,
        }
      );
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        setAppliedCoupon(res.data);
        if (res.data.userData) setLogin(res.data.userData);
        if (res.data.access_Token) setToken(res.data.access_Token);
        toast.success(`Coupon ${res.data.code} applied!`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const res = await axios.post(
        `${apiUrl}/remove-coupon/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          xsrfCookieName: "csrftoken",
          xsrfHeaderName: "X-CSRFToken",
          withXSRFToken: true,
        }
      );
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        setAppliedCoupon(null);
        setCouponCode("");
        if (res.data.userData) setLogin(res.data.userData);
        if (res.data.access_Token) setToken(res.data.access_Token);
        toast.success("Coupon removed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to remove coupon");
    }
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error("Add a delivery address to continue");
      return;
    }
    if (!mobile_no) {
      toast.error("Add a mobile number to continue");
      return;
    }
    if (!window.Razorpay) {
      toast.error("Payment gateway is still loading, please try again in a moment");
      return;
    }

    setPlacing(true);
    try {
      const payload = { address_index: selectedAddress };
      if(couponCode) payload.couponId = couponCode;

      // buynow flow (single product, no cart cookie) → send items explicitly
      // cart flow → backend reads the signed cart cookie itself
      if (!cartItems || !cartItems.length) {
        payload.items = items.map((i) => ({
          product_id: i.product_id,
          qty: i.qty,
          price: i.price,
        }));
      }

      const { data } = await axios.post(`${apiUrl}/create-payment/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        xsrfCookieName: "csrftoken",
        xsrfHeaderName: "X-CSRFToken",
        withXSRFToken: true,
      });

      // backend sends business errors with 200 + error field
      if (data.error) {
        toast.error(data.error);
        setPlacing(false);
        return;
      }

      if (!data.userData || !data.access_Token) {
        toast.error("Session expired, please login again");
        setLogin(null);
        setToken(null);
        navigate("/login");
        setPlacing(false);
        return;
      }
      setLogin(data.userData);
      setToken(data.access_Token);
      let navigated = false;
      let safetyTimer;

      const goToProcessing = (razorpayOrderId) => {
        if (navigated) return;
        navigated = true;
        clearTimeout(safetyTimer);
        navigate("/order-processing", { state: { razorpayOrderId } });
      };

      const options = {
        key: RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency || "INR",
        order_id: data.order_id,
        name: "SS Garments",
        description: `Order for ${totalItems} ${totalItems === 1 ? "item" : "items"}`,
        prefill: { name: login?.name, contact: mobile_no },
        theme: { color: "#4A0E1C" },
        modal: {
          ondismiss: async() => {
            try {
        await axios.post(
          `${apiUrl}/payment-cancel/${data.order_id}/`,
          {},
          {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        xsrfCookieName: "csrftoken",
        xsrfHeaderName: "X-CSRFToken",
        withXSRFToken: true,
          }
        );
        clearTimeout(safetyTimerRef.current);
      } catch (err) {
        console.error("Failed to mark payment as dismissed", err);
      }
      toast.error("Payment cancelled");
    }    
        },
        handler: function (response) {
          console.log("handler fired", response);
          goToProcessing(response.razorpay_order_id);
        },
      };

      const rzp = new window.Razorpay(options);
      rzpInstanceRef.current = rzp;

      rzp.on("payment.failed", (resp) => {
        toast.error(resp?.error?.description || "Payment failed, please try again");
        setPlacing(false);
        clearTimeout(safetyTimerRef.current);
      });

      rzp.open();

      safetyTimerRef.current = setTimeout(() => {
      if (rzpInstanceRef.current) {
        try {
          async()=>{
            await axios.post(
          `${apiUrl}/payment-cancel/${data.order_id}/`,
          {},
          {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        xsrfCookieName: "csrftoken",
        xsrfHeaderName: "X-CSRFToken",
        withXSRFToken: true,
          }
        );

          }
      rzpInstanceRef.current.close();
      toast.error("Payment timed out, please try again");


    }   catch(err) {toast.error(`something went wrong ${err.message}`)}
        
      }
}, 12 * 60 * 1000); // 12 minutes
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Session expired, please login again");
        setLogin(null);
        setToken(null);
        navigate("/login");
      } else {
        toast.error(err?.response?.data?.error || "Could not start payment, please try again");
      }
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF6EF] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div className="max-w-md mx-auto text-center py-24 px-6">
          <p className="text-[#2B2422] font-medium mb-2">There's nothing to check out yet</p>
          <p className="text-sm text-[#8A7F73] mb-6">Add something to your bag first.</p>
          <Link
            to="/cart"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#4A0E1C] text-[#FFFDF9] text-sm font-semibold"
          >
            Go to cart
          </Link>
        </div>
        <Footer className="max-w-screen" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF6EF] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar />

      {/* Edit profile modal */}
      {editProfile && (
        <div className="fixed inset-0 bg-[#2B2422]/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setEditProfile(false)}
              className="absolute top-4 right-4 text-[#B0A48F] hover:text-[#2B2422]"
            >
              <X size={18} />
            </button>
            <h2
              className="text-lg text-[#2B2422] mb-5"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              Edit your name
            </h2>
            <input
              name="name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE3D3] text-sm focus:outline-none focus:border-[#B8862E] mb-5"
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setEditProfile(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#8A7F73] border border-[#EDE3D3]"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#4A0E1C] text-[#FFFDF9]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit address modal */}
      {isEditOpen && (
        <AddressPage
          pageName={"Edit Address"}
          index={selectedAddress}
          address={login?.address}
          closeModal={() => setIsEditOpen(false)}
          uploadSetAddress={uploadSetAddress}
        />
      )}

      {/* Select address modal */}
      {selectionPage && (
        <div className="fixed inset-0 bg-[#2B2422]/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg text-[#2B2422]"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                Select delivery address
              </h2>
              <button
                onClick={() => setSelectionPage(false)}
                className="text-[#B0A48F] hover:text-[#2B2422]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {login?.address?.map((item, key) => (
                <div
                  key={key}
                  onClick={() => setSelectedAddress(key)}
                  className={`text-sm text-[#2B2422] rounded-xl p-3.5 cursor-pointer border transition-colors ${
                    selectedAddress === key
                      ? "border-[#B8862E] bg-[#FBF3E0]"
                      : "border-[#EDE3D3] bg-white"
                  }`}
                >
                  <p>{item.address}</p>
                  <p className="text-[#8A7F73] mt-0.5">
                    {item.city}, {item.state} - {item.pincode}
                  </p>
                  {selectedAddress === key && (
                    <div className="flex items-center gap-1 text-[#3F7D58] text-xs font-medium mt-1.5">
                      <Check size={12} />
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setSelectionPage(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4A0E1C] text-[#FFFDF9]"
              >
                Use this address
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-16">
        {/* Stepper */}
        <div className="flex items-center mb-9 max-w-md">
          {STEPS.map((label, i) => {
            const isActive = i === 1;
            const isDone = i < 1;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                    style={{
                      backgroundColor: isDone ? "#B8862E" : isActive ? "#4A0E1C" : "transparent",
                      color: isDone || isActive ? "#FFFDF9" : "#B0A48F",
                      border: isDone || isActive ? "none" : "1.5px solid #DCD0B8",
                    }}
                  >
                    {isDone ? <Check size={13} /> : i + 1}
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h1
              className="text-[28px] sm:text-[32px] leading-tight text-[#2B2422]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              Review your order
            </h1>
            <p className="text-sm text-[#8A7F73] mt-1.5">
              {totalItems} {totalItems === 1 ? "item" : "items"} · Order will be placed after payment
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#8A6A15] bg-[#F5E9C8] border border-[#E7D49E] px-3 py-1.5 rounded-full w-fit">
            <Sparkles size={13} />
            10% discount applied
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left column */}
          <div className="space-y-5">
            {/* Name + address */}
            <div className="bg-white rounded-2xl border border-[#EDE3D3] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em]">
                  Name
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#2B2422]">{login?.name}</span>
                  <img
                    src={edit}
                    className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                    alt="edit"
                    onClick={() => {
                      setProfileName(login?.name || "");
                      setEditProfile(true);
                    }}
                  />
                </div>
              </div>

              <div className="h-px bg-[#F3EDE0]" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FBF3E0] flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-[#B8862E]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-1">
                      Delivering to
                    </p>
                    {address ? (
                      <p className="text-sm text-[#2B2422] leading-relaxed max-w-md">
                        {address.address}, {address.city}, {address.state} - {address.pincode}
                      </p>
                    ) : (
                      <p className="text-sm text-[#8A7F73]">No address added yet</p>
                    )}
                  </div>
                </div>

                {address ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <img
                      src={edit}
                      className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                      alt="edit"
                      onClick={() => setIsEditOpen(true)}
                    />
                    <button
                      onClick={() => setSelectionPage(true)}
                      className="text-xs font-medium text-[#4A0E1C] flex items-center gap-0.5 hover:underline"
                    >
                      Change
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/account"
                    className="text-xs font-semibold text-[#FFFDF9] bg-[#4A0E1C] px-3 py-1.5 rounded-full shrink-0"
                  >
                    Add address
                  </Link>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-[#EDE3D3] p-5 sm:p-6">
              <h2 className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-5">
                Order items
              </h2>

              <div className="divide-y divide-[#F3EDE0]">
                {items.map((item, idx) => (
                  <div key={item.product_id || idx} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[72px] h-[88px] rounded-xl object-cover shrink-0 border border-[#EDE3D3]"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14.5px] font-medium text-[#2B2422] leading-snug">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#9C9082]">
                        <span>Size {item.size}</span>
                        {item.color && <span>Color {item.color}</span>}
                        <span>Qty {item.qty}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#2B2422]">
                        {currency(item.price * item.qty)}
                      </p>
                      <p className="text-[11px] text-[#B0A48F] mt-0.5">{currency(item.price)} / piece</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Secure payments" },
                { icon: RotateCcw, label: "6-hours easy returns" },
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
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EDE3D3] p-6">
              <h2 className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-5">
                Payment summary
              </h2>

              {/* ── Coupon section ── */}
              <div className="mb-5">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="COUPON CODE"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EDE3D3] text-sm focus:outline-none focus:border-[#B8862E] uppercase tracking-wide"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#4A0E1C] text-[#FFFDF9] disabled:opacity-60 transition-all"
                    >
                      {couponLoading ? "Applying…" : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[#FBF3E0] border border-[#E7D49E] rounded-xl px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#4A0E1C] flex items-center justify-center">
                        <Tag size={13} className="text-[#FFFDF9]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2B2422] uppercase tracking-wide">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-[#3F7D58] font-medium">
                          −{currency(appliedCoupon.discount_amount)} saved
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-[#8A7F73] hover:text-[#4A0E1C] px-2 py-1 rounded-lg hover:bg-[#F5E9C8] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-[#4A413A]">
                <div className="flex justify-between">
                  <span>
                    Subtotal <span className="text-[#B0A48F]">({totalItems} items)</span>
                  </span>
                  <span>{currency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-[#3F7D58]">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} />
                    Discount (10%)
                  </span>
                  <span>−{currency(defaultDiscount)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#3F7D58]">
                    <span className="flex items-center gap-1.5">
                      <Tag size={13} />
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span>−{currency(appliedCoupon.discount_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-[#9C9082]" />
                    Delivery
                  </span>
                  <span>{currency(shipping)}</span>
                </div>
              </div>

              <div className="h-px bg-[#F0E9DD] my-5" />

              <div className="flex justify-between items-baseline mb-1">
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
              <p className="text-[11px] text-[#B0A48F] mb-6">Inclusive of all taxes</p>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                type="button"
                className="w-full py-3.5 rounded-xl bg-[#4A0E1C] text-[#FFFDF9] text-sm font-semibold tracking-wide hover:bg-[#3A0B16] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {placing ? "Placing order…" : `Proceed to pay ${currency(total)}`}
                {!placing && <ChevronRight size={16} />}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#B0A48F] mt-4">
                <Lock size={12} />
                Your payment is encrypted and secure
              </p>
            </div>

            <p className="text-[11px] text-[#B0A48F] text-center px-4 leading-relaxed">
              By placing this order you agree to SS Garments'{" "}
              <span className="text-[#8A7F73] underline underline-offset-2" onClick={() => navigate("/terms")}>
                terms
              </span> and{" "}
              <span className="text-[#8A7F73] underline underline-offset-2" onClick={() => navigate("/returns")}>
                return policy
              </span>.
            </p>
          </div>
        </div>
      </div>

      <Footer className="max-w-screen" />
    </div>
  );
}