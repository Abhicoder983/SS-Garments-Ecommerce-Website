import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "./NavBar";
import Footer from "./Footer";
import AddressPage from "./inPages/AddressPage";
import userImg from "../assets/AccountAssests/user.png";
import {
  Pencil,
  LogOut,
  Plus,
  Trash2,
  MapPin,
  Package,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Camera,
  Phone,
  MessageCircle,
  Store,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Account() {
  const { login, setLogin, token, setToken, reload } = useContext(AuthContext);

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [option, setOption] = useState("address");
  const [editProfile, setEditProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pageName, setPageName] = useState("ADD");
  const [editAddressIndex, setEditAddressIndex] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  // New states for shopkeeper modal
  const [shopkeeperModal, setShopkeeperModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'cancel' or 'return'
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Fetch account
  useEffect(() => {
    if (login && token && !reload) {
      setAddresses(login.address);
      return;
    }

    const fetchAccount = async () => {
      try {
        const res = await axios.get(`${apiUrl}/account/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setLogin(res.data.userData);
        setToken(res.data.access_Token);
        setAddresses(res.data.userData.address || []);
      } catch {
        toast.error("Login required");
        setLogin(null);
        setToken(null);
        navigate("/login");
      }
    };
    fetchAccount();
  }, []);

  // Fetch orders
  const fetchOrder = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await axios.get(`${apiUrl}/orderdetails/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setOrders(res?.data?.userOrderData || []);
      setLogin(res.data.userData);
      setToken(res.data.access_Token);
    } catch (err) {
      setLogin(null);
      setToken(null);
      toast.error(err.response?.data?.userorderData || "Failed to load orders");
      navigate("/login");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Save / Delete address
  const uploadSetAddress = async (updated) => {
    try {
      const res = await axios.patch(
        `${apiUrl}/account/`,
        { address: updated },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setLogin(res.data.userData);
      setToken(res.data.access_Token);
      setAddresses(res.data.userData.address);
      toast.success("Address updated");
    } catch {
      setLogin(null);
      setToken(null);
      toast.error("Address update failed");
      navigate("/login");
    }
  };

  const handleProfileSave = async () => {
    if (!profileName.trim() && profileImage == undefined) {
      toast.error("Please enter a name or select an image");
      return;
    }
    const formData = new FormData();
    if (profileImage != undefined) formData.append("profile_image", profileImage);
    if (profileName != "") formData.append("name", profileName);

    try {
      const res = await axios.patch(`${apiUrl}/account/`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setLogin(res.data.userData);
      setToken(res.data.access_Token);
      toast.success("Profile updated successfully");
      setEditProfile(false);
      setProfileImage(null);
      setProfileName("");
    } catch {
      setLogin(null);
      setToken(null);
      toast.error("Update failed. Please try logging out and back in.");
      setEditProfile(false);
      navigate("/login");
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${apiUrl}/logout/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Successfully logged out");
      setToken(null);
      setLogin(null);
      navigate("/login");
    } catch {
      toast.error("Something went wrong");
    }
  };

  // Open shopkeeper modal for cancel/return
  const openShopkeeperModal = (order, action) => {
    setSelectedOrder(order);
    setModalAction(action);
    setShopkeeperModal(true);
  };


  const getStatusConfig = (status) => {
    const configs = {
      CONFIRMED: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <CheckCircle2 size={14} />,
        label: "Confirmed",
      },
      SHIPPED: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <Truck size={14} />,
        label: "Shipped",
      },
      DELIVERED: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 size={14} />,
        label: "Delivered",
      },
      CANCELLED: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle size={14} />,
        label: "Cancelled",
      },
      PENDING: {
        color: "bg-slate-50 text-slate-700 border-slate-200",
        icon: <Clock size={14} />,
        label: "Pending",
      },
      RETURNED: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <RotateCcw size={14} />,
        label: "Returned",
      },
    };
    return (
      configs[status] || {
        color: "bg-slate-50 text-slate-700 border-slate-200",
        icon: <Clock size={14} />,
        label: status,
      }
    );
  };

  // Shopkeeper data - in production this should come from order data
  const getShopkeeperInfo = () => {
    // Fallback data - replace with actual order.shopkeeper data when available
    return {
      name: "Fashion Hub Store",
      location: "123 Market Street, Commercial Complex, Bangalore - 560001",
      phone: "+91 98765 43210",
      whatsapp:"+91 98765 43210",
    };
  };
  const handleCancelOrder = ()=>{

  }

  if (!login) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#4A0E1C] border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 text-[#8A7F73] text-sm font-medium animate-pulse">
          Fetching account details…
        </p>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div
        className="min-h-screen bg-[#FAF8F5] pb-20"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          
          {/* ===== USER INFO CARD ===== */}
          <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-[#EDE8E0] p-6 sm:p-8 mb-8 relative overflow-hidden">
            {/* Subtle decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#4A0E1C]/[0.03] to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* Avatar */}
              <div className="relative shrink-0 group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3px] border-[#F5F0E8] overflow-hidden bg-[#F5F0E8] shadow-lg shadow-black/5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <img
                    src={login?.profile_image_url || userImg}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setEditProfile(true)}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-[#4A0E1C] hover:bg-[#4A0E1C] hover:text-white transition-all duration-200 border border-[#EDE8E0] hover:scale-110"
                >
                  <Camera size={15} />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left pt-2">
                <h1
                  className="text-2xl sm:text-3xl text-[#2B2422] capitalize leading-tight tracking-tight"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                >
                  {login?.name || "Not provided"}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
                  <p className="text-sm text-[#9A9187] font-medium">
                    {login?.email || "Not provided"}
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-[#9A9187]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Verified Account
                  </span>
                  <span>·</span>
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 shrink-0 sm:pt-3">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#4A0E1C] bg-[#FDF6ED] hover:bg-[#F5E6D0] border border-[#F0E4D4] transition-all duration-200 hover:shadow-md active:scale-95"
                  onClick={() => setEditProfile(true)}
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#B24444] bg-[#FDF2F2] hover:bg-[#FCE0E0] border border-[#F5D5D5] transition-all duration-200 hover:shadow-md active:scale-95"
                  onClick={logout}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* ===== TABS ===== */}
          <div className="flex items-center gap-2 mb-8 sticky top-4 z-30 bg-[#FAF8F5]/80 backdrop-blur-xl py-2 px-1 -mx-1 rounded-2xl">
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                option === "address"
                  ? "bg-[#4A0E1C] text-white shadow-lg shadow-[#4A0E1C]/25 scale-105"
                  : "bg-white text-[#6B6560] border border-[#E8E2DA] hover:border-[#D4CCC2] hover:bg-[#FDFBF7] hover:shadow-md"
              }`}
              onClick={() => setOption("address")}
            >
              <MapPin size={17} strokeWidth={option === "address" ? 2.5 : 2} />
              Addresses
              {addresses.length > 0 && (
                <span
                  className={`ml-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    option === "address"
                      ? "bg-white/25 text-white"
                      : "bg-[#F5F0E8] text-[#8A7F73]"
                  }`}
                >
                  {addresses.length}
                </span>
              )}
            </button>

            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                option === "orders"
                  ? "bg-[#4A0E1C] text-white shadow-lg shadow-[#4A0E1C]/25 scale-105"
                  : "bg-white text-[#6B6560] border border-[#E8E2DA] hover:border-[#D4CCC2] hover:bg-[#FDFBF7] hover:shadow-md"
              }`}
              onClick={() => {
                setOption("orders");
                fetchOrder();
              }}
            >
              <Package size={17} strokeWidth={option === "orders" ? 2.5 : 2} />
              Orders
              {orders.length > 0 && (
                <span
                  className={`ml-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    option === "orders"
                      ? "bg-white/25 text-white"
                      : "bg-[#F5F0E8] text-[#8A7F73]"
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </button>

            {option === "address" && (
              <button
                onClick={() => {
                  setEditAddressIndex(null);
                  setPageName("ADD");
                  setIsEditOpen(true);
                }}
                className="ml-auto flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-[#2D5A3D] bg-[#EDF7F1] hover:bg-[#DDEEDF] border border-[#C8E6D5] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus size={17} />
                Add New
              </button>
            )}
          </div>

          {/* ===== ADDRESS LIST ===== */}
          {option === "address" && (
            <div className="space-y-4">
              {addresses.length ? (
                addresses.map((item, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-2xl border border-[#EDE8E0] p-5 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:shadow-xl hover:shadow-black/[0.04] hover:border-[#DDD5C8] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FDF6ED] to-[#F5E6D0] flex items-center justify-center text-[#4A0E1C] shrink-0 mt-0.5 shadow-sm">
                        <MapPin size={19} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] text-[#2B2422] leading-relaxed font-semibold">
                          {item.address}
                        </p>
                        <p className="text-sm text-[#9A9187] mt-1 font-medium">
                          {item.city}, {item.state} — {item.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 shrink-0 pl-[3.75rem] sm:pl-0">
                      <button
                        onClick={() => {
                          setEditAddressIndex(index);
                          setPageName("EDIT");
                          setIsEditOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#8A6A15] bg-[#FDF6ED] hover:bg-[#F5E6D0] border border-[#F0E4D4] transition-all duration-200 hover:shadow-sm active:scale-95"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          const updated = addresses.filter((_, i) => i !== index);
                          uploadSetAddress(updated);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#B24444] bg-[#FDF2F2] hover:bg-[#FCE0E0] border border-[#F5D5D5] transition-all duration-200 hover:shadow-sm active:scale-95"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-[#D4CCC2] p-16 text-center hover:border-[#C4B8A8] transition-colors duration-300">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FDFBF7] to-[#F5F0E8] flex items-center justify-center mx-auto mb-5 text-[#C4B8A8] shadow-inner">
                    <MapPin size={32} />
                  </div>
                  <h3 className="text-[#2B2422] font-bold text-lg mb-2">
                    No addresses saved
                  </h3>
                  <p className="text-sm text-[#9A9187] mb-6 max-w-xs mx-auto">
                    Add a delivery address to get started with your shopping experience
                  </p>
                  <button
                    onClick={() => {
                      setEditAddressIndex(null);
                      setPageName("ADD");
                      setIsEditOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#4A0E1C] bg-[#FDF6ED] hover:bg-[#F5E6D0] border border-[#F0E4D4] transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    <Plus size={17} />
                    Add Address
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== ORDERS ===== */}
          {option === "orders" && (
            <div className="space-y-6">
              {isLoadingOrders ? (
                <div className="bg-white rounded-3xl border border-[#EDE8E0] p-16 text-center">
                  <div className="w-12 h-12 rounded-full border-3 border-[#4A0E1C] border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-sm text-[#9A9187] font-medium">Loading your orders…</p>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order, orderIndex) => {
                  const finalTotal =
                    order.Total_price - order.discount + order.delivery_charge;
                  
                  // Logic for buttons
                  const canCancel = order.statusID === "CONFIRMED" || order.statusID === "PENDING";
                  const canReturn = order.statusID === "DELIVERED";
                  const isCancelled = order.statusID === "CANCELLED";
                  const isReturned = order.statusID === "RETURNED";
                  
                  const statusConfig = getStatusConfig(order.statusID);

                  return (
                    <div
                      key={orderIndex}
                      className="bg-white rounded-3xl border border-[#EDE8E0] overflow-hidden hover:shadow-xl hover:shadow-black/[0.05] transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* Order Header */}
                      <div className="px-6 sm:px-8 py-5 border-b border-[#F5F0E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-[#FDFBF7]/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FDF6ED] to-[#F5E6D0] flex items-center justify-center text-[#4A0E1C] shadow-sm">
                            <Package size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-[#2B2422] text-[15px]">
                                Order #{String(orderIndex + 1).padStart(3, "0")}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${statusConfig.color} shadow-sm`}
                              >
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-xs text-[#9A9187] mt-1.5 font-medium">
                              {new Date(order.order_date).toLocaleDateString("en-IN", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                              {" · "}
                              {new Date(order.order_date).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] text-[#9A9187] mb-0.5 uppercase tracking-wider font-bold">Total Amount</p>
                          <p className="text-xl font-bold text-[#2B2422] tracking-tight">
                            ₹{finalTotal}
                          </p>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="px-6 sm:px-8 py-5 space-y-4">
                        {order.productID?.product_ids?.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#F5F0E8] hover:border-[#EDE8E0] hover:bg-[#FAF8F5] transition-all duration-200 group/item"
                          >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white shrink-0 border border-[#F5F0E8] shadow-sm group-hover/item:shadow-md transition-shadow">
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <h4 className="font-bold text-sm text-[#2B2422] truncate">
                                {item.product_name}
                              </h4>
                              <div className="flex items-center gap-3 mt-3 text-xs">
                                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#F0EAE3] text-[#6B6560] font-semibold shadow-sm">
                                  Size {item.size}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#F0EAE3] text-[#6B6560] font-semibold shadow-sm">
                                  Qty {item.qty}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-[#6B6560] font-medium">
                                  ₹{item.price}{" "}
                                  <span className="text-xs text-[#9A9187]">/ piece</span>
                                </p>
                                <p className="text-sm font-bold text-[#2B2422]">
                                  ₹{item.qty * item.price}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Price Breakdown */}
                      <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-[#FDFBF7] to-[#F5F0E8]/30 border-t border-[#F5F0E8]">
                        <div className="max-w-xs ml-auto space-y-2.5">
                          <div className="flex justify-between text-sm text-[#6B6560]">
                            <span className="font-medium">Subtotal</span>
                            <span className="font-bold">₹{order.Total_price}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700 font-medium">Discount</span>
                            <span className="font-bold text-emerald-700">− ₹{order.discount}</span>
                          </div>
                          <div className="flex justify-between text-sm text-[#6B6560]">
                            <span className="font-medium">Delivery</span>
                            <span className="font-bold">₹{order.delivery_charge}</span>
                          </div>
                          <div className="flex justify-between text-[15px] font-bold text-[#2B2422] pt-3 border-t-2 border-[#E8E2DA] border-dashed">
                            <span>Total</span>
                            <span>₹{finalTotal}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info & Actions */}
                      <div className="px-6 sm:px-8 py-5 border-t border-[#F5F0E8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                        <div className="text-xs text-[#9A9187] space-y-1.5">
                          {order.delivered_at && (
                            <p className="flex items-center gap-1.5 font-medium">
                              <CheckCircle2 size={13} className="text-emerald-500" />
                              Delivered on{" "}
                              <span className="font-bold text-[#6B6560]">
                                {new Date(order.delivered_at).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </p>
                          )}
                          <p className="font-medium">
                            Last updated{" "}
                            {new Date(order.updated_at).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                          {/* Return Button - Only for delivered orders */}
                          {canReturn && (
                            <button
                              onClick={() => openShopkeeperModal(order, "return")}
                              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-[#7C3AED] bg-[#F3E8FF] hover:bg-[#E9D5FF] border border-[#DDD6FE] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
                            >
                              <RotateCcw size={15} />
                              Return
                            </button>
                          )}
                          
                          {/* Cancel Button - Disabled when shipped/delivered/cancelled/returned */}
                          {!isCancelled && !isReturned && (
                            <button
                              disabled={!canCancel}
                              onClick={() => canCancel && openShopkeeperModal(order, "cancel")}
                              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                                canCancel
                                  ? "bg-[#4A0E1C] text-white hover:bg-[#3A0B16] shadow-lg shadow-[#4A0E1C]/25 active:scale-95"
                                  : "bg-[#F5F0E8] text-[#B0A89E] cursor-not-allowed"
                              }`}
                            >
                              <XCircle size={15} />
                              {canCancel ? "Cancel Order" : "Cannot Cancel"}
                            </button>
                          )}
                          
                          {isCancelled && (
                            <span className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#B24444] bg-[#FDF2F2] border border-[#F5D5D5] flex items-center gap-2">
                              <XCircle size={15} />
                              Cancelled
                            </span>
                          )}
                          
                          {isReturned && (
                            <span className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#7C3AED] bg-[#F3E8FF] border border-[#DDD6FE] flex items-center gap-2">
                              <RotateCcw size={15} />
                              Returned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-[#D4CCC2] p-16 text-center hover:border-[#C4B8A8] transition-colors duration-300">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FDFBF7] to-[#F5F0E8] flex items-center justify-center mx-auto mb-5 text-[#C4B8A8] shadow-inner">
                    <Package size={32} />
                  </div>
                  <h3 className="text-[#2B2422] font-bold text-lg mb-2">
                    No orders yet
                  </h3>
                  <p className="text-sm text-[#9A9187] mb-6 max-w-xs mx-auto">
                    Your order history will appear here once you make a purchase
                  </p>
                  <button
                    onClick={() => navigate("/shop")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#4A0E1C] bg-[#FDF6ED] hover:bg-[#F5E6D0] border border-[#F0E4D4] transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    Start Shopping
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* ===== EDIT PROFILE MODAL ===== */}
      {editProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#2B2422]/60 backdrop-blur-sm"
            onClick={() => setEditProfile(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditProfile(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-[#9A9187] hover:text-[#2B2422] hover:bg-[#F5F0E8] transition-all"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FDF6ED] to-[#F5E6D0] flex items-center justify-center mx-auto mb-3 text-[#4A0E1C] shadow-sm">
                <Pencil size={22} />
              </div>
              <h2
                className="text-xl text-[#2B2422]"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                Edit Profile
              </h2>
              <p className="text-sm text-[#9A9187] mt-1">
                Update your name and profile photo
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-[#6B6560] uppercase tracking-wider mb-2.5">
                  Display Name
                </label>
                <input
                  name="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E8E2DA] text-sm text-[#2B2422] placeholder:text-[#C4B8A8] focus:outline-none focus:border-[#4A0E1C] focus:ring-4 focus:ring-[#4A0E1C]/5 transition-all bg-[#FDFBF7] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B6560] uppercase tracking-wider mb-2.5">
                  Profile Photo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files[0])}
                    className="w-full text-sm text-[#9A9187] file:mr-4 file:px-4 file:py-3 file:rounded-xl file:border-0 file:bg-[#FDF6ED] file:text-[#4A0E1C] file:text-sm file:font-bold file:cursor-pointer hover:file:bg-[#F5E6D0] transition-all bg-[#FDFBF7] border border-[#E8E2DA] rounded-xl px-4 py-2.5"
                  />
                </div>
                {profileImage && (
                  <p className="text-xs text-emerald-600 mt-2.5 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 size={13} />
                    {profileImage.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditProfile(false)}
                className="flex-1 px-4 py-3.5 rounded-xl text-sm font-bold text-[#6B6560] border border-[#E8E2DA] hover:bg-[#F5F0E8] transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="flex-1 px-4 py-3.5 rounded-xl text-sm font-bold bg-[#4A0E1C] text-white hover:bg-[#3A0B16] shadow-xl shadow-[#4A0E1C]/25 transition-all active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SHOPKEEPER CONTACT MODAL (Cancel/Return) ===== */}
      {shopkeeperModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#2B2422]/60 backdrop-blur-sm"
            onClick={() => setShopkeeperModal(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Decorative top bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              modalAction === "cancel" ? "bg-gradient-to-r from-[#B24444] to-[#D47575]" : "bg-gradient-to-r from-[#7C3AED] to-[#A78BFA]"
            }`} />
            
            <button
              onClick={() => setShopkeeperModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-[#9A9187] hover:text-[#2B2422] hover:bg-[#F5F0E8] transition-all"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6 pt-2">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                modalAction === "cancel" 
                  ? "bg-gradient-to-br from-[#FDF2F2] to-[#FCE0E0] text-[#B24444]" 
                  : "bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] text-[#7C3AED]"
              }`}>
                {modalAction === "cancel" ? <AlertCircle size={28} /> : <RotateCcw size={28} />}
              </div>
              <h2
                className="text-xl text-[#2B2422]"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                {modalAction === "cancel" ? "Cancel Order" : "Return Order"}
              </h2>
              <p className="text-sm text-[#9A9187] mt-1.5 max-w-sm mx-auto leading-relaxed">
                {modalAction === "cancel" 
                  ? "Please contact the shopkeeper to proceed with cancellation" 
                  : "Please contact the shopkeeper to initiate your return request"}
              </p>
            </div>

            {/* Shopkeeper Info Card */}
            <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5F0E8] rounded-2xl p-5 border border-[#EDE8E0] mb-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E8E2DA]">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#4A0E1C] shadow-sm">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#2B2422] text-sm">
                    {getShopkeeperInfo(selectedOrder).name}
                  </h3>
                  <p className="text-xs text-[#9A9187] font-medium">Shopkeeper</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#4A0E1C] shrink-0 shadow-sm mt-0.5">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm text-[#2B2422] font-medium leading-relaxed">
                      {getShopkeeperInfo(selectedOrder).location}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#4A0E1C] shrink-0 shadow-sm">
                    <Phone size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider mb-0.5">Phone</p>
                    <a 
                      href={`tel:${getShopkeeperInfo(selectedOrder).phone}`}
                      className="text-sm text-[#2B2422] font-bold hover:text-[#4A0E1C] transition-colors"
                    >
                      {getShopkeeperInfo(selectedOrder).phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0 shadow-sm">
                    <MessageCircle size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider mb-0.5">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${getShopkeeperInfo(selectedOrder).whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#16A34A] font-bold hover:text-[#15803D] transition-colors"
                    >
                      {getShopkeeperInfo(selectedOrder).whatsapp}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShopkeeperModal(false)}
                className="flex-1 px-4 py-3.5 rounded-xl text-sm font-bold text-[#6B6560] border border-[#E8E2DA] hover:bg-[#F5F0E8] transition-all active:scale-95"
              >
                Close
              </button>
              <button
                onClick={modalAction === "cancel" ? handleCancelOrder :""}
                className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl transition-all active:scale-95 ${
                  modalAction === "cancel"
                    ? "bg-gradient-to-r from-[#B24444] to-[#D47575] hover:from-[#A33D3D] hover:to-[#C46A6A] shadow-[#B24444]/25"
                    : "hidden"
                }`}
              >
                {modalAction === "cancel" ? "Confirm Cancellation" : "Confirm Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <AddressPage
          pageName={pageName}
          index={editAddressIndex}
          address={addresses}
          setAddress={setAddresses}
          closeModal={() => setIsEditOpen(false)}
          uploadSetAddress={uploadSetAddress}
        />
      )}
    </>
  );
}