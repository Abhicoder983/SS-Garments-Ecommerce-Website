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
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

export default function ProductDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("id");
  const sizename = searchParams.get("size");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [sizes, setSizes] = useState(null);
  const { login, setLogin, token, setToken } = useContext(AuthContext);
  const [qty, setQty] = useState(1);

  // Shared logic for applying a productData payload to state,
  // used by both the success and error branches of the fetch below.
  const applyProductResponse = (data) => {
    setLogin(data?.userData ?? null);
    setToken(data?.access_Token ?? null);

    if (!data?.productData) {
      toast.error(data?.message || "Failed to load product");
      setProduct(null);
      return;
    }

    const productData = data.productData;
    setProduct(productData);

    const idx = productData?.variants?.findIndex(
      (variant) => variant.variant_id == variantId
    );
    const color = idx != null && idx !== -1 ? idx : 0;

    setSelectedColor(color);
    setSelectedImage(color);

    const variantSizes = productData?.variants?.[color]?.sizes || null;
    setSizes(variantSizes);

    if (sizename) {
      const sizeIndex = variantSizes?.findIndex((s) => s.size == sizename);
      if (sizeIndex != null && sizeIndex !== -1) {
        setSelectedSize(sizeIndex);
      } else {
        setSelectedSize(0);
      }
    } else {
      setSelectedSize(0);
    }
  };

  const addToCart = async (id) => {
    if (!login && !token) {
      toast.warning("Before adding to the Cart Please login");
      return;
    }
    if (!id) {
      toast.warning("Please select a size");
      return;
    }

    setAddingToCart(true);
    try {
      const res = await axios.post(
        `${apiUrl}/cart/`,
        { product_id: id, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          xsrfCookieName: "csrftoken",
          xsrfHeaderName: "X-CSRFToken",
          withXSRFToken: true,
        }
      );
      const data = res.data;
      data?.error ? toast.error(data?.error) : toast.success("Saved to Cart");
      setLogin(data?.userData ?? null);
      setToken(data?.access_Token ?? null);
    } catch (err) {
      const data = err.response?.data;
      toast.warning(data?.error || "Something went wrong");
      setLogin(null);
      setToken(null);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/productDetail/${variantId}/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          xsrfCookieName: "csrftoken",
          xsrfHeaderName: "X-CSRFToken",
          withXSRFToken: true,
        });
        if (cancelled) return;
        applyProductResponse(res.data);
      } catch (err) {
        if (cancelled) return;
        const data = err.response?.data;
        if (data) {
          applyProductResponse(data);
        } else {
          toast.error("Failed to load product");
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (variantId) {
      fetchProduct();
    } else {
      setLoading(false);
      setProduct(null);
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId, sizename]);

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
  const currentSize = sizes?.[selectedSize];
  const currentPrice = currentSize?.price;
  const originalPrice =
    typeof currentPrice === "number" ? Math.round(currentPrice * 1.3) : null;
  const outOfStock = currentSize?.stock === 0;
  const maxQty = currentSize?.stock ?? Infinity;

  return (
    <div
      className="min-h-screen bg-[#FAF8F5] flex flex-col overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <NavBar />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#9A9187] overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 hover:text-[#4A0E1C] transition-colors shrink-0"
          >
            <Home size={12} />
            Home
          </button>
          <ChevronRight size={12} className="shrink-0" />
          <button
            onClick={() => {
              window.history.back();
            }}
            className="hover:text-[#4A0E1C] transition-colors shrink-0"
          >
            Shop
          </button>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-[#2B2422] font-medium truncate max-w-[140px] sm:max-w-[200px]">
            {product.product_name}
          </span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex-1">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* IMAGE SECTION */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EDE8E0] p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#FDFBF7]">
                <img
                  key={currentImages}
                  src={currentImages}
                  className="absolute inset-0 w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                  alt={product.product_name}
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
                <button
                  type="button"
                  aria-label="Add to wishlist"
                  className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#4A0E1C] hover:bg-[#4A0E1C] hover:text-white transition-all shadow-sm border border-[#EDE8E0]"
                >
                  <Heart size={16} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product?.variants?.map((variant, i) => (
                <button
                  key={variant?.variant_id ?? i}
                  type="button"
                  onClick={() => {
                    setSelectedImage(i);
                    setSelectedColor(i);
                    setSizes(variant.sizes);
                    setSelectedSize(0);
                  }}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-[#FDFBF7] transition-all duration-200 ${
                    selectedImage === i
                      ? "border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                      : "border-[#EDE8E0] hover:border-[#D4CCC2]"
                  }`}
                >
                  <img
                    src={variant?.image}
                    className="w-full h-full object-cover"
                    alt={variant?.color}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  {selectedImage === i && (
                    <div className="absolute inset-0 bg-[#4A0E1C]/10" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col min-w-0">
            {/* Brand & Rating */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-3">
              <span className="px-3 py-1 rounded-lg bg-[#FDF6ED] text-[#8A6A15] text-xs font-bold border border-[#F0E4D4]">
                {product?.brand}
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
                <span className="text-xs text-[#9A9187] ml-1 font-medium">
                  (4.0)
                </span>
              </div>
            </div>

            {/* Title */}
            <h1
              className="text-xl sm:text-3xl lg:text-4xl text-[#2B2422] capitalize leading-tight mb-2 break-words"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              {product.product_name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 mt-3 mb-6">
              <span className="text-2xl sm:text-4xl font-bold text-[#4A0E1C] tracking-tight">
                {currentPrice != null ? `₹${currentPrice}` : "—"}
              </span>
              {originalPrice != null && (
                <>
                  <span className="text-sm text-[#9A9187] line-through">
                    ₹{originalPrice}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    23% OFF
                  </span>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl bg-white border border-[#EDE8E0] text-center">
                <Truck size={18} className="text-[#4A0E1C]" />
                <span className="text-[9px] sm:text-[10px] font-bold text-[#6B6560]">
                  Safe Delivery
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl bg-white border border-[#EDE8E0] text-center">
                <RotateCcw size={18} className="text-[#4A0E1C]" />
                <span className="text-[9px] sm:text-[10px] font-bold text-[#6B6560]">
                  6-Hour Return
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl bg-white border border-[#EDE8E0] text-center">
                <ShieldCheck size={18} className="text-[#4A0E1C]" />
                <span className="text-[9px] sm:text-[10px] font-bold text-[#6B6560]">
                  Secure
                </span>
              </div>
            </div>

            <div className="h-px bg-[#EDE8E0] mb-6" />

            {/* COLORS */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm font-bold text-[#2B2422] uppercase tracking-wider">
                  Color
                </p>
                <span className="text-xs text-[#9A9187] font-medium truncate">
                  {product.variants?.[selectedColor]?.color || "Color is not found"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, i) => (
                  <button
                    key={variant?.variant_id ?? i}
                    type="button"
                    onClick={() => {
                      setSelectedColor(i);
                      setSelectedImage(i);
                      setSizes(variant.sizes);
                      setSelectedSize(0);
                    }}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      selectedColor === i
                        ? "bg-[#4A0E1C] text-white border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                        : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2] hover:bg-[#FDFBF7]"
                    }`}
                  >
                    {variant?.color}
                  </button>
                ))}
              </div>
            </div>

            {/* SIZES */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm font-bold text-[#2B2422] uppercase tracking-wider">
                  Size
                </p>
                <span className="text-xs text-[#9A9187] font-medium">
                  {currentSize?.size}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes?.map((size, i) => (
                  <button
                    key={size?.size_id ?? i}
                    type="button"
                    onClick={() => setSelectedSize(i)}
                    disabled={size.stock === 0}
                    title={size.stock === 0 ? "Out of stock" : undefined}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-sm font-bold border transition-all duration-200 shrink-0 ${
                      selectedSize === i
                        ? "bg-[#2B2422] text-white border-[#2B2422] shadow-md"
                        : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2] hover:bg-[#FDFBF7]"
                    } ${
                      size.stock === 0
                        ? "opacity-40 cursor-not-allowed line-through"
                        : ""
                    }`}
                  >
                    {size.size.replace("_", " ").toUpperCase()}
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
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg bg-[#FDFBF7] hover:bg-[#F5F0E8] flex items-center justify-center text-[#2B2422] transition-colors shrink-0"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-[#2B2422]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="w-9 h-9 rounded-lg bg-[#FDFBF7] hover:bg-[#F5F0E8] flex items-center justify-center text-[#2B2422] transition-colors shrink-0"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white rounded-2xl border border-[#EDE8E0] p-4 sm:p-5 mb-6">
              <h3
                className="text-base text-[#2B2422] mb-2"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                Description
              </h3>
              <p className="text-sm text-[#6B6560] leading-relaxed first-letter:uppercase break-words">
                {product.description}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
              <button
                type="button"
                disabled={outOfStock || addingToCart}
                className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl text-sm font-bold bg-[#FDF6ED] text-[#4A0E1C] hover:bg-[#F5E6D0] border border-[#F0E4D4] transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                onClick={() => addToCart(currentSize?.size_id)}
              >
                <ShoppingCart size={18} className="shrink-0" />
                <span className="truncate">
                  {outOfStock ? "Out of Stock" : addingToCart ? "Adding…" : "Add to Cart"}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/buynow", {
                    state: { product, variant: selectedImage, selectedSize, qty },
                  })
                }
                disabled={outOfStock}
                className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl text-sm font-bold bg-[#4A0E1C] text-white hover:bg-[#3A0B16] transition-all duration-200 shadow-lg shadow-[#4A0E1C]/25 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
              >
                <Zap size={18} className="shrink-0" />
                <span className="truncate">
                  {outOfStock ? "Out of Stock" : "Buy Now"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}