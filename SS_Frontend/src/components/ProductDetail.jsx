import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  Zap,
  ChevronRight,
  Home,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Heart,
  Share2,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

export default function ProductDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [sizes, setSizes] = useState(null);
  const { login, setLogin, token, setToken } = useContext(AuthContext);
  const [qty, setQty] = useState(1);

  const addToCart = async (id) => {
    if (!login && !token) {
      toast.warning("Before adding to the Cart Please login");
      return;
    }
    console.log(token);
    try {
      const res = await axios.post(
        `${apiUrl}/cart/`,
        { product_id: id,
          qty
         },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          xsrfCookieName: 'csrftoken',
          xsrfHeaderName: 'X-CSRFToken',
          withXSRFToken: true,
        }
      );
      const data = res.data;
      console.log(res);
      console.log(13)
      data?.error?toast.error(data?.error):toast.success("Saved to Cart ");
      console.log(14)
      setLogin(data.userData);
      setToken(data.access_Token);
    } catch (err) {
      const data = err.response?.data;
      toast.warning(data?.error);

      setLogin(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${apiUrl}/productDetail/${variantId}/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          xsrfCookieName: 'csrftoken',
          xsrfHeaderName: 'X-CSRFToken',
          withXSRFToken: true,
        });
        const data = res.data;
        setLogin(data.userData);
        setToken(data.access_Token);
        data?.productData? "": toast.error(data?.message);
        setProduct(data?.productData);
        setSizes(data?.productData?.variants?.[selectedColor]?.sizes || null);
      } catch (err) {
        console.log(err);
        const data = err.response.data;
        setLogin(data.userData);
        setToken(data.access_Token);
        data?.productData? "": toast.error(data?.message);
        setProduct(data?.productData);
        setSizes(data?.productData?.variants?.[selectedColor]?.sizes || null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [variantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#4A0E1C] border-t-transparent animate-spin" />
          <p className="mt-4 text-[#8A7F73] text-sm font-medium animate-pulse">
            Loading product details…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#C4B8A8] mb-4">
            <ShoppingCart size={32} />
          </div>
          <h2
            className="text-2xl text-[#2B2422] mb-2"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Not Found
          </h2>
          <p className="text-sm text-[#9A9187] mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-[#4A0E1C] text-white hover:bg-[#3A0B16] transition-all shadow-lg shadow-[#4A0E1C]/25"
          >
            Browse Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentImages = product?.variants?.[selectedColor]?.image;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <NavBar />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[#9A9187]">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 hover:text-[#4A0E1C] transition-colors"
          >
            <Home size={12} />
            Home
          </button>
          <ChevronRight size={12} />
          <button
            onClick={() => { window.history.back(); }}
            className="hover:text-[#4A0E1C] transition-colors"
          >
            Shop
          </button>
          <ChevronRight size={12} />
          <span className="text-[#2B2422] font-medium truncate max-w-[200px]">
            {product.product_name}
          </span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 🖼 IMAGE SECTION */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-3xl border border-[#EDE8E0] p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FDFBF7]">
                <img
                  src={currentImages}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                  alt={product.product_name}
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#4A0E1C] hover:bg-[#4A0E1C] hover:text-white transition-all shadow-sm border border-[#EDE8E0]">
                  <Heart size={16} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product?.variants?.map((variant, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImage(i);
                    setSelectedColor(i);
                    setSizes(variant.sizes);
                  }}
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === i
                      ? "border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                      : "border-[#EDE8E0] hover:border-[#D4CCC2]"
                  }`}
                >
                  <img
                    src={variant?.image}
                    className="w-full h-full object-cover"
                    alt={variant?.color}
                  />
                  {selectedImage === i && (
                    <div className="absolute inset-0 bg-[#4A0E1C]/10" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 📦 PRODUCT INFO */}
          <div className="flex flex-col">
            {/* Brand & Rating */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-lg bg-[#FDF6ED] text-[#8A6A15] text-xs font-bold border border-[#F0E4D4]">
                {product!=""?.brand}
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < 4 ? "currentColor" : "none"}
                    strokeWidth={2}
                  />
                ))}
                <span className="text-xs text-[#9A9187] ml-1 font-medium">(4.0)</span>
              </div>
            </div>

            {/* Title */}
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl text-[#2B2422] capitalize leading-tight mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              {product.product_name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-3 mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-[#4A0E1C] tracking-tight">
                ₹{sizes?.[selectedSize]?.price}
              </span>
              <span className="text-sm text-[#9A9187] line-through">
                ₹{Math.round(sizes?.[selectedSize]?.price * 1.3)}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                23% OFF
              </span>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[#EDE8E0] text-center">
                <Truck size={18} className="text-[#4A0E1C]" />
                <span className="text-[10px] font-bold text-[#6B6560]">Safe Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[#EDE8E0] text-center">
                <RotateCcw size={18} className="text-[#4A0E1C]" />
                <span className="text-[10px] font-bold text-[#6B6560]">6-Hour Return</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[#EDE8E0] text-center">
                <ShieldCheck size={18} className="text-[#4A0E1C]" />
                <span className="text-[10px] font-bold text-[#6B6560]">Secure</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#EDE8E0] mb-6" />

            {/* 🎨 COLORS */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-[#2B2422] uppercase tracking-wider">
                  Color
                </p>
                <span className="text-xs text-[#9A9187] font-medium">
                  {product.variants?.[selectedColor]?.color || "Color is not found"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedColor(i);
                      setSelectedImage(i);
                      setSizes(variant.sizes);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      selectedColor === i
                        ? "bg-[#4A0E1C] text-white border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                        : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2] hover:bg-[#FDFBF7]"
                    }`}
                  >
                    {variant?.color }
                  </button>
                ))}
              </div>
            </div>

            {/* 📏 SIZES */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-[#2B2422] uppercase tracking-wider">
                  Size
                </p>
                <span className="text-xs text-[#9A9187] font-medium">
                  {sizes?.[selectedSize]?.size }
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes?.map((size, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(i)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold border transition-all duration-200 ${
                      selectedSize === i
                        ? "bg-[#2B2422] text-white border-[#2B2422] shadow-md"
                        : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2] hover:bg-[#FDFBF7]"
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-bold text-[#2B2422] uppercase tracking-wider mb-3">
                Quantity
              </p>
              <div className="inline-flex items-center gap-3 bg-white border border-[#E8E2DA] rounded-xl p-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 rounded-lg bg-[#FDFBF7] hover:bg-[#F5F0E8] flex items-center justify-center text-[#2B2422] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-[#2B2422]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-9 h-9 rounded-lg bg-[#FDFBF7] hover:bg-[#F5F0E8] flex items-center justify-center text-[#2B2422] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* 📝 DESCRIPTION */}
            <div className="bg-white rounded-2xl border border-[#EDE8E0] p-5 mb-6">
              <h3
                className="text-base text-[#2B2422] mb-2"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                Description
              </h3>
              <p className="text-sm text-[#6B6560] leading-relaxed first-letter:uppercase">
                {product.description}
              </p>
            </div>

            {/* 🛒 ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
             <button
  disabled={sizes?.[selectedSize]?.stock === 0}
  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold bg-[#FDF6ED] text-[#4A0E1C] hover:bg-[#F5E6D0] border border-[#F0E4D4] transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
  onClick={() => addToCart(sizes[selectedSize]?.size_id)}
>
                <ShoppingCart size={18} />
                
                {sizes?.[selectedSize]?.stock === 0?"Out of Stock for add to cart ":"Add to Cart"}
              </button>

              <button
                onClick={() =>
                  navigate("/buynow", {
                    state: { product, variant: selectedImage, selectedSize, qty },
                  })
                }
                disabled={sizes?.[selectedSize]?.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold bg-[#4A0E1C] text-white hover:bg-[#3A0B16] transition-all duration-200 shadow-lg shadow-[#4A0E1C]/25 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
              >
                <Zap size={18} />
                {sizes?.[selectedSize]?.stock === 0?"Out of Stock for buying":"Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}