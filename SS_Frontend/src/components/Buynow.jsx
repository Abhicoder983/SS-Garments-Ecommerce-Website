import { useContext, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../Context/AuthContext";
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
  Banknote,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const DISCOUNT_RATE = 0.1;
const STEPS = ["Bag", "Review & pay", "Confirmed"];
const COD_ADVANCE = 99;

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
  const qty = location.state?.qty

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
      return [
        {
          product_id: sizeObj?.size_id,
          name: product?.product_name,
          image: v?.image,
          size: sizeObj?.size,
          color: v?.color,
          price: sizeObj?.price,
          qty: qty,
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
  const [mobile_no, setMobile_no] = useState(login?.mobile_no || "");

  /* 🔹 Gates the whole page until we know we have a valid session/account.
     Starts true whenever we don't already have login+token in context. */
  const [pageLoading, setPageLoading] = useState(!(login && token));

  /* ── Payment method: "ONLINE" (full amount online) | "COD" (₹99 advance) ── */
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  /* ── Coupon state ── */
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [editNumber, setEditNumber] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem("buynow_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (login && token) {
      setPageLoading(false);
      return;
    }

    const fetchAccount = async () => {
      try {
        const res = await axios.get(`${apiUrl}/account/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          xsrfCookieName: "csrftoken",
          xsrfHeaderName: "X-CSRFToken",
          withXSRFToken: true,
        });

        setLogin(res.data.userData);
        setToken(res.data.access_Token);
      } catch {
        toast.error("Login required");
        setLogin(null);
        setToken(null);
        navigate("/login");
      } finally {
        setPageLoading(false);
      }
    };
    fetchAccount();
  }, []);

  // Keep the mobile number field in sync once account data arrives
  useEffect(() => {
    setMobile_no(login?.mobile_no || "");
  }, [login?.mobile_no]);

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
    const formData = new FormData();
    if (profileName !== "") formData.append("name", profileName);
    if (mobile_no !== "") formData.append("mobile_no", mobile_no);

    try {
      const res = await axios.patch(`${apiUrl}/account/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        xsrfCookieName: "csrftoken",
        xsrfHeaderName: "X-CSRFToken",
        withXSRFToken: true,
      });
      setLogin(res.data.userData);
      setToken(res.data.access_Token);
      toast("Profile updated");
      setEditProfile(false);
      setEditNumber(false);
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
          xsrfCookieName: "csrftoken",
          xsrfHeaderName: "X-CSRFToken",
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

  const total = Math.max(0, subtotal - defaultDiscount - couponDiscount);

  /* ── COD split: ₹99 advance now, rest on delivery ── */
  const payableNow = paymentMethod === "COD" ? Math.min(COD_ADVANCE, total) : total;
  const codBalance = Math.max(0, total - COD_ADVANCE);

  const address = login?.address?.[selectedAddress];

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

      setAppliedCoupon(res.data);
      if (res.data.user_error) {
        setToken(null);
        setLogin(null);
      }
      if (res.data.userData) setLogin(res.data.userData);
      if (res.data.access_Token) setToken(res.data.access_Token);
      toast.success(`Coupon ${res.data.code} applied!`);
    } catch (err) {
      if (err?.response?.data.user_error) {
        setToken(null);
        setLogin(null);
      }
      if (err?.response?.data?.userData) setLogin(err.response.data.userData);
      if (err?.response?.data?.access_Token) setToken(err.response.data.access_Token);

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

      setAppliedCoupon(null);
      setCouponCode("");
      if (res.data.user_error) {
        setLogin(null);
        setToken(null);
      }
      if (res.data.userData) setLogin(res.data.userData);
      if (res.data.access_Token) setToken(res.data.access_Token);
      toast.success("Coupon removed");
    } catch (err) {
      if (err?.response?.data?.user_error) {
        setLogin(null);
        setToken(null);
      }
      if (err?.response?.data?.userData) setLogin(err.response.data.userData);
      if (err?.response?.data?.access_Token) setToken(err.response.data.access_Token);
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
      const payload = {
        address_index: selectedAddress,
        payment_method: paymentMethod, // 🔹 "ONLINE" | "cod"
      };
      // 🔧 use the confirmed applied coupon, not the (possibly stale/edited) input text
      if (appliedCoupon?.code) payload.couponId = appliedCoupon.code;

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

      const goToProcessing = (razorpayOrderId) => {
        if (navigated) return;
        navigated = true;
        clearTimeout(safetyTimerRef.current);
        navigate("/order-processing", {
          state: { razorpayOrderId, paymentMethod },
        });
      };

      const cancelPayment = async () => {
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
        } catch (err) {
          console.error("Failed to mark payment as cancelled", err);
        }
      };

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.amount, // 🔹 backend returns full total for ONLINE, 9900 paise for COD
        currency: data.currency || "INR",
        order_id: data.order_id,
        name: "SS Garments",
        description:
          paymentMethod === "COD"
            ? `COD advance of ${currency(COD_ADVANCE)}`
            : `Order for ${totalItems} ${totalItems === 1 ? "item" : "items"}`,
        prefill: { name: login?.name, contact: mobile_no },
        theme: { color: "#4A0E1C" },
        modal: {
          ondismiss: async () => {
            await cancelPayment();
            clearTimeout(safetyTimerRef.current);
            setPlacing(false);
            toast.error("Payment cancelled");
          },
        },
        handler: function (response) {
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

      safetyTimerRef.current = setTimeout(async () => {
        if (rzpInstanceRef.current) {
          try {
            await cancelPayment();
            rzpInstanceRef.current.close();
            toast.error("Payment timed out, please try again");
            setPlacing(false);
          } catch (err) {
            toast.error(`Something went wrong: ${err.message}`);
          }
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

  /* ── 🆕 Full-page loader while account/session is being resolved ── */
  if (pageLoading) {
    return (
      <div className="bg-[#FAF6EF] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div className="flex flex-col items-center justify-center gap-4 py-24 sm:py-32">
          <ClipLoader color="#4A0E1C" size={38} />
          <p className="text-sm text-[#8A7F73]">Loading your checkout…</p>
        </div>
        <Footer className="max-w-screen" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF6EF] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
        <NavBar />
        <div className="max-w-md mx-auto text-center py-16 sm:py-24 px-4 sm:px-6">
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
    <div className="bg-[#FAF6EF] min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar />

      {/* Edit profile modal */}
      {editProfile && (
        <div className="fixed inset-0 bg-[#2B2422]/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditProfile(false)}
              className="absolute top-4 right-4 text-[#B0A48F] hover:text-[#2B2422] p-1"
            >
              <X size={18} />
            </button>
            <h2
              className="text-lg text-[#2B2422] mb-5 pr-6"
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
            <div className="flex flex-wrap justify-end gap-2.5">
              <button
                onClick={() => setEditProfile(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#8A7F73] border border-[#EDE3D3]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // 🔧 was `!profileName.trim` (always truthy, method ref) — now actually calls trim()
                  if (!profileName.trim()) {
                    toast.error("Enter the valid Name");
                    return;
                  }
                  handleProfileSave();
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#4A0E1C] text-[#FFFDF9]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {editNumber && (
        <div className="fixed inset-0 bg-[#2B2422]/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditNumber(false)}
              className="absolute top-4 right-4 text-[#B0A48F] hover:text-[#2B2422] p-1"
            >
              <X size={18} />
            </button>
            <h2
              className="text-lg text-[#2B2422] mb-5 pr-6"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              {login?.mobile_no ? "Edit your phone number" : "Add your phone number"}
            </h2>
            <input
              name="mobile_no"
              value={mobile_no}
              onChange={(e) => setMobile_no(e.target.value)}
              placeholder="Your phone number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE3D3] text-sm focus:outline-none focus:border-[#B8862E] mb-5"
            />
            <div className="flex flex-wrap justify-end gap-2.5">
              <button
                onClick={() => setEditNumber(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#8A7F73] border border-[#EDE3D3]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!/^\d{10}$/.test(mobile_no)) {
                    toast.error("Please enter a valid 10-digit mobile number");
                    return;
                  }
                  handleProfileSave();
                }}
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
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg text-[#2B2422]"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                Select delivery address
              </h2>
              <button
                onClick={() => setSelectionPage(false)}
                className="text-[#B0A48F] hover:text-[#2B2422] p-1"
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
                  <p className="break-words">{item.address}</p>
                  <p className="text-[#8A7F73] mt-0.5 break-words">
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4A0E1C] text-[#FFFDF9]"
              >
                Use this address
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {/* Stepper */}
        <div className="flex items-center mb-7 sm:mb-9 w-full sm:max-w-md overflow-x-auto">
          {STEPS.map((label, i) => {
            const isActive = i === 1;
            const isDone = i < 1;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none min-w-fit">
                <div className="flex items-center gap-2 sm:gap-2.5">
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
                    className="text-[11px] sm:text-xs whitespace-nowrap"
                    style={{ color: isActive ? "#2B2422" : "#B0A48F", fontWeight: isActive ? 600 : 400 }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[#DCD0B8] mx-2 sm:mx-3 min-w-[16px] sm:min-w-[24px]" />}
              </div>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1
              className="text-2xl sm:text-[28px] lg:text-[32px] leading-tight text-[#2B2422]"
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

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_360px] gap-5 sm:gap-6 items-start">
          {/* Left column */}
          <div className="space-y-4 sm:space-y-5 min-w-0">
            {/* Name + address */}
            <div className="bg-white rounded-2xl border border-[#EDE3D3] p-4 sm:p-5 lg:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em]">
                  Name
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-[#2B2422] truncate max-w-[160px] sm:max-w-none">{login?.name}</span>
                  <button
                    className="p-1.5 -m-1.5 shrink-0"
                    onClick={() => {
                      setProfileName(login?.name || "");
                      setEditProfile(true);
                    }}
                  >
                    <img
                      src={edit}
                      className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                      alt="edit"
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] shrink-0">
                  Mobile No.
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#2B2422]">
                    {login?.mobile_no ? login.mobile_no : null}
                  </span>
                  {login?.mobile_no ? (
                    <button
                      className="p-1.5 -m-1.5 shrink-0"
                      onClick={() => {
                        setMobile_no(login?.mobile_no || "");
                        setEditNumber(true);
                      }}
                    >
                      <img
                        src={edit}
                        className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                        alt="edit"
                      />
                    </button>
                  ) : (
                    <div
                      className="text-xs font-semibold text-[#FFFDF9] bg-[#4A0E1C] px-3 py-1.5 rounded-full shrink-0 cursor-pointer whitespace-nowrap"
                      onClick={() => {
                        setMobile_no(login?.mobile_no || "");
                        setEditNumber(true);
                      }}
                    >
                      ADD Mobile No.
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-[#F3EDE0]" />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FBF3E0] flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-[#B8862E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-1">
                      Delivering to
                    </p>
                    {address ? (
                      <p className="text-sm text-[#2B2422] leading-relaxed break-words">
                        {address.address}, {address.city}, {address.state} - {address.pincode}
                      </p>
                    ) : (
                      <p className="text-sm text-[#8A7F73]">No address added yet</p>
                    )}
                  </div>
                </div>

                {address ? (
                  <div className="flex items-center gap-3 shrink-0 pl-12 sm:pl-0">
                    <button className="p-1.5 -m-1.5" onClick={() => setIsEditOpen(true)}>
                      <img
                        src={edit}
                        className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                        alt="edit"
                      />
                    </button>
                    <button
                      onClick={() => setSelectionPage(true)}
                      className="text-xs font-medium text-[#4A0E1C] flex items-center gap-0.5 hover:underline whitespace-nowrap"
                    >
                      Change
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/account"
                    className="text-xs font-semibold text-[#FFFDF9] bg-[#4A0E1C] px-3 py-1.5 rounded-full shrink-0 w-fit"
                  >
                    Add address
                  </Link>
                )}
              </div>
            </div>

            {/* ── Payment method ── */}
            <div className="bg-white rounded-2xl border border-[#EDE3D3] p-4 sm:p-5 lg:p-6">
              <h2 className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-4">
                Payment method
              </h2>

              <div className="space-y-2.5">
                {/* ONLINE */}
                <label
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                    paymentMethod === "ONLINE"
                      ? "border-[#B8862E] bg-[#FBF3E0]"
                      : "border-[#EDE3D3] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                    className="mt-1 accent-[#4A0E1C] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#2B2422]">Pay online</p>
                      <span className="text-sm font-semibold text-[#2B2422] whitespace-nowrap">
                        {currency(total)}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A7F73] mt-0.5">
                      UPI, cards & net banking via Razorpay · Pay in full now
                    </p>
                  </div>
                </label>

                {/* Cash on delivery */}
                <label
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                    paymentMethod === "COD"
                      ? "border-[#B8862E] bg-[#FBF3E0]"
                      : "border-[#EDE3D3] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 accent-[#4A0E1C] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#2B2422] flex items-center gap-1.5">
                        <Banknote size={15} className="text-[#3F7D58] shrink-0" />
                        Cash on delivery
                      </p>
                      <span className="text-sm font-semibold text-[#2B2422] whitespace-nowrap">
                        {currency(COD_ADVANCE)} now
                      </span>
                    </div>
                    <p className="text-xs text-[#8A7F73] mt-0.5">
                      Pay a {currency(COD_ADVANCE)} advance online now, balance{" "}
                      <span className="font-medium text-[#4A0E1C]">{currency(codBalance)}</span>{" "}
                      in cash/UPI when your order arrives.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-[#EDE3D3] p-4 sm:p-5 lg:p-6">
              <h2 className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-5">
                Order items
              </h2>

              <div className="divide-y divide-[#F3EDE0]">
                {items.map((item, idx) => (
                  <div key={item.product_id || idx} className="flex items-center gap-3 sm:gap-4 py-4 sm:py-5 first:pt-0 last:pb-0">
                    <div className="w-14 h-[70px] sm:w-[72px] sm:h-[88px] rounded-xl shrink-0 border border-[#EDE3D3] bg-[#F3EDE0] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-[14.5px] font-medium text-[#2B2422] leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 mt-2 text-xs text-[#9C9082]">
                        <span>Size {item.size}</span>
                        {item.color && <span>Color {item.color}</span>}
                        <span>Qty {item.qty}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#2B2422]">
                        {currency(item.price * item.qty)}
                      </p>
                      <p className="text-[11px] text-[#B0A48F] mt-0.5 whitespace-nowrap">{currency(item.price)} / piece</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: ShieldCheck, label: "Secure payments" },
                { icon: RotateCcw, label: "6-hours easy returns" },
                { icon: Truck, label: "Tracked delivery" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-white border border-[#EDE3D3] rounded-xl px-2 sm:px-3 py-3 sm:py-3.5 flex flex-col items-center text-center gap-1.5"
                >
                  <Icon size={17} className="text-[#B8862E]" />
                  <span className="text-[10px] sm:text-[11px] text-[#8A7F73] leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — summary */}
          <div className="md:sticky md:top-6 space-y-4 min-w-0">
            <div className="bg-white rounded-2xl border border-[#EDE3D3] p-4 sm:p-5 lg:p-6">
              <h2 className="text-xs font-semibold text-[#8A7F73] uppercase tracking-[0.12em] mb-5">
                Payment summary
              </h2>

              {/* ── Coupon section ── */}
              <div className="mb-5">
                {!appliedCoupon ? (
                  <div className="flex flex-col xs:flex-row sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="COUPON CODE"
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#EDE3D3] text-sm focus:outline-none focus:border-[#B8862E] uppercase tracking-wide"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#4A0E1C] text-[#FFFDF9] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      {couponLoading && <ClipLoader color="#FFFDF9" size={12} />}
                      {couponLoading ? "Applying…" : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 bg-[#FBF3E0] border border-[#E7D49E] rounded-xl px-3 sm:px-3.5 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#4A0E1C] flex items-center justify-center shrink-0">
                        <Tag size={13} className="text-[#FFFDF9]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2B2422] uppercase tracking-wide truncate">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-[#3F7D58] font-medium whitespace-nowrap">
                          −{currency(appliedCoupon.discount_amount)} saved
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-[#8A7F73] hover:text-[#4A0E1C] px-2 py-1 rounded-lg hover:bg-[#F5E9C8] transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-[#4A413A]">
                <div className="flex justify-between gap-2">
                  <span>
                    Subtotal <span className="text-[#B0A48F]">({totalItems} items)</span>
                  </span>
                  <span className="whitespace-nowrap">{currency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-[#3F7D58] gap-2">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} />
                    Discount (10%)
                  </span>
                  <span className="whitespace-nowrap">−{currency(defaultDiscount)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#3F7D58] gap-2">
                    <span className="flex items-center gap-1.5 min-w-0 truncate">
                      <Tag size={13} className="shrink-0" />
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span className="whitespace-nowrap">−{currency(appliedCoupon.discount_amount)}</span>
                  </div>
                )}

                {paymentMethod === "COD" && (
                  <div className="flex justify-between text-[#8A6A15] gap-2">
                    <span className="flex items-center gap-1.5">
                      <Banknote size={13} />
                      Balance on delivery
                    </span>
                    <span className="whitespace-nowrap">{currency(codBalance)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-[#F0E9DD] my-5" />

              <div className="flex justify-between items-baseline mb-1 gap-2">
                <span
                  className="text-base text-[#2B2422]"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                >
                  Total
                </span>
                <span
                  className="text-xl sm:text-2xl text-[#4A0E1C] whitespace-nowrap"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                >
                  {currency(total)}
                </span>
              </div>

              {paymentMethod === "COD" && (
                <p className="text-[11px] text-[#8A6A15] mb-2">
                  Pay {currency(COD_ADVANCE)} advance now · {currency(codBalance)} on delivery
                </p>
              )}

              <p className="text-[11px] text-[#B0A48F] mb-6">Inclusive of all taxes</p>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                type="button"
                className="w-full py-3.5 rounded-xl bg-[#4A0E1C] text-[#FFFDF9] text-sm font-semibold tracking-wide hover:bg-[#3A0B16] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {placing && <ClipLoader color="#FFFDF9" size={14} />}
                {placing
                  ? "Placing order…"
                  : paymentMethod === "COD"
                  ? `Pay ${currency(COD_ADVANCE)} advance`
                  : `Proceed to pay ${currency(total)}`}
                {!placing && <ChevronRight size={16} />}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#B0A48F] mt-4">
                <Lock size={12} />
                Your payment is encrypted and secure
              </p>
            </div>

            <p className="text-[11px] text-[#B0A48F] text-center px-4 leading-relaxed">
              By placing this order you agree to SS Garments'{" "}
              <span className="text-[#8A7F73] underline underline-offset-2 cursor-pointer" onClick={() => navigate("/terms")}>
                terms
              </span>{" "}
              and{" "}
              <span className="text-[#8A7F73] underline underline-offset-2 cursor-pointer" onClick={() => navigate("/returns")}>
                return policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      <Footer className="max-w-screen" />
    </div>
  );
}