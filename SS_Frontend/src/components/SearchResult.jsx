import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  User,
  Ruler,
  Banknote,
  Search,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 15;

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [openFilter, setOpenFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [gender, setGender] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  // Hardcoded lists - backend se nahi aayenge
  const sortOptions = [
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
  ];

  const genderOptions = [
    { value: "male", label: "Men" },
    { value: "female", label: "Women" },
  ];

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSize(searchParams.get("size") || "");
    setOrderBy(searchParams.get("order") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setGender(searchParams.get("gender") || null);
  }, [searchParams]);

  useEffect(() => {
    if (!search) return;
    const params = new URLSearchParams();
    params.set("search", search);
    if (size) params.set("size", size);
    if (maxPrice) params.set("max_price", maxPrice);
    if (minPrice) params.set("min_price", minPrice);
    if (orderBy) params.set("order", orderBy);
    if (gender) params.set("gender", gender);

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [search, size, maxPrice, orderBy, minPrice, gender]);

  useEffect(() => {
    if (!searchParams.get("search")) {
      navigate("/");
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams(searchParams);
        if (!qs.get("page")) qs.set("page", "1");
        qs.set("page_size", PAGE_SIZE);

        const res = await axios.get(`${apiUrl}/products/?${qs.toString()}`, {
          withCredentials: true,
          xsrfCookieName: "csrftoken",
          xsrfHeaderName: "X-CSRFToken",
          withXSRFToken: true,
        });
        setProducts(res.data.products || []);

        const pages =
          res.data.total_pages ||
          Math.ceil((res.data.total_count || res.data.count || 0) / PAGE_SIZE) ||
          1;
        setTotalPages(pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest("[data-filter-dropdown]")) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const clearFilters = () => {
    setSize("");
    setMaxPrice("");
    setMinPrice("");
    setSearchParams({ search });
    setOrderBy("");
    setGender(null);
    setOpenFilter(null);
  };

  const activeFilterCount = [size, maxPrice, minPrice, orderBy, gender].filter(
    Boolean
  ).length;

  const toggleFilter = (key) => {
    setOpenFilter((prev) => (prev === key ? null : key));
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // windowed page numbers with ellipses, e.g. 1 … 4 5 6 … 12
  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 1;
    const start = Math.max(2, currentPage - windowSize);
    const end = Math.min(totalPages - 1, currentPage + windowSize);

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div
      className="min-h-screen bg-[#FAF8F5] flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <NavBar />

      {/* Header */}
      <div className="bg-white border-b border-[#EDE8E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1
                className="text-xl sm:text-2xl lg:text-3xl text-[#2B2422]"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
              >
                {searchParams.get("search") ? (
                  <>
                    Results for{" "}
                    <span className="text-[#4A0E1C]">
                      "{searchParams.get("search")}"
                    </span>
                  </>
                ) : (
                  "All Products"
                )}
              </h1>
              <p className="text-xs sm:text-sm text-[#9A9187] mt-1">
                {!loading &&
                  `${products.length} product${
                    products.length !== 1 ? "s" : ""
                  } found`}
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#B24444] bg-[#FDF2F2] hover:bg-[#FCE0E0] border border-[#F5D5D5] transition-all self-start sm:self-auto"
              >
                <RotateCcw size={12} />
                Clear {activeFilterCount}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar - NO overflow-x-auto, flex-wrap instead */}
      <div className="sticky top-11 sm:top-12 z-40 bg-white/95 backdrop-blur-xl border-b border-[#EDE8E0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-[#9A9187] mr-1">
              <SlidersHorizontal size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                Filters
              </span>
            </div>

            {/* Sort */}
            <div className="relative" data-filter-dropdown>
              <button
                onClick={() => toggleFilter("sort")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  orderBy
                    ? "bg-[#4A0E1C] text-white border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                    : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2]"
                }`}
              >
                <ArrowUpDown size={13} />
                <span className="hidden sm:inline">Sort</span>
                {orderBy && (
                  <span className="text-[10px] opacity-80">
                    {orderBy === "price_low" ? "Low" : "High"}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    openFilter === "sort" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openFilter === "sort" && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-[#EDE8E0] rounded-2xl shadow-xl shadow-black/10 min-w-[200px] p-2 z-[50]">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setOrderBy(orderBy === opt.value ? "" : opt.value);
                        setOpenFilter(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1 last:mb-0 ${
                        orderBy === opt.value
                          ? "bg-[#4A0E1C] text-white"
                          : "text-[#2B2422] hover:bg-[#F5F0E8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="relative" data-filter-dropdown>
              <button
                onClick={() => toggleFilter("gender")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  gender
                    ? "bg-[#4A0E1C] text-white border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                    : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2]"
                }`}
              >
                <User size={13} />
                <span className="hidden sm:inline">Gender</span>
                {gender && (
                  <span className="text-[10px] opacity-80 capitalize">
                    {gender}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    openFilter === "gender" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openFilter === "gender" && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-[#EDE8E0] rounded-2xl shadow-xl shadow-black/10 min-w-[160px] p-2 z-[50]">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setGender(gender === opt.value ? null : opt.value);
                        setOpenFilter(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1 last:mb-0 capitalize ${
                        gender === opt.value
                          ? "bg-[#4A0E1C] text-white"
                          : "text-[#2B2422] hover:bg-[#F5F0E8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Size */}
            <div className="relative" data-filter-dropdown>
              <button
                onClick={() => toggleFilter("size")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  size
                    ? "bg-[#4A0E1C] text-white border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                    : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2]"
                }`}
              >
                <Ruler size={13} />
                <span className="hidden sm:inline">Size</span>
                {size && <span className="text-[10px] opacity-80">{size}</span>}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    openFilter === "size" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openFilter === "size" && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-[#EDE8E0] rounded-2xl shadow-xl shadow-black/10 p-3 z-[50]">
                  <div className="grid grid-cols-4 gap-1.5 min-w-[200px]">
                    {sizeOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSize(size === s ? "" : s);
                          setOpenFilter(null);
                        }}
                        className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                          size === s
                            ? "bg-[#4A0E1C] text-white border-[#4A0E1C]"
                            : "bg-white text-[#2B2422] border-[#E8E2DA] hover:border-[#D4CCC2] hover:bg-[#FDFBF7]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="relative" data-filter-dropdown>
              <button
                onClick={() => toggleFilter("price")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  minPrice || maxPrice
                    ? "bg-[#4A0E1C] text-white border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                    : "bg-white text-[#6B6560] border-[#E8E2DA] hover:border-[#D4CCC2]"
                }`}
              >
                <Banknote size={13} />
                <span className="hidden sm:inline">Price</span>
                {(minPrice || maxPrice) && (
                  <span className="text-[10px] opacity-80">
                    ₹{minPrice || 0}-₹{maxPrice || "∞"}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    openFilter === "price" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openFilter === "price" && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-[#EDE8E0] rounded-2xl shadow-xl shadow-black/10 w-64 p-4 z-[50]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                      Price Range
                    </p>
                    {(minPrice || maxPrice) && (
                      <button
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                        }}
                        className="text-[10px] font-bold text-[#B24444] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9187] text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="Min price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#E8E2DA] text-sm text-[#2B2422] focus:border-[#4A0E1C] focus:ring-2 focus:ring-[#4A0E1C]/10 outline-none transition-all bg-[#FDFBF7]"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9187] text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="Max price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#E8E2DA] text-sm text-[#2B2422] focus:border-[#4A0E1C] focus:ring-2 focus:ring-[#4A0E1C]/10 outline-none transition-all bg-[#FDFBF7]"
                      />
                    </div>
                    <button
                      onClick={() => setOpenFilter(null)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#4A0E1C] text-white hover:bg-[#3A0B16] transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-[#4A0E1C] border-t-transparent animate-spin" />
            <p className="mt-4 text-[#8A7F73] text-sm font-medium animate-pulse">
              Finding products…
            </p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#C4B8A8] mb-4">
              <Search size={28} />
            </div>
            <h2
              className="text-xl text-[#2B2422] mb-1"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              No products found
            </h2>
            <p className="text-sm text-[#9A9187] mb-5">
              Try adjusting your filters
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#4A0E1C] text-white hover:bg-[#3A0B16] transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((item) => (
              <div
                key={item.variant_id}
                className="group bg-white rounded-2xl border border-[#EDE8E0] overflow-hidden hover:shadow-lg hover:shadow-black/[0.05] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/checkout?id=${item.variant_id}`)}
              >
                <div className="relative aspect-[3/4] bg-[#FDFBF7] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#4A0E1C] border border-[#F0E4D4]">
                      {item.brand}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#2B2422]/80 backdrop-blur-sm text-[10px] font-bold text-white">
                      {item.color}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4">
                  <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-wider mb-1">
                    {item.category}
                  </p>
                  <h3 className="text-xs sm:text-sm font-bold text-[#2B2422] leading-snug line-clamp-2 mb-2 group-hover:text-[#4A0E1C] transition-colors">
                    {item.product_name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-bold text-[#4A0E1C]">
                      ₹{Math.round(item.price)}
                    </span>
                    <span className="text-xs text-[#C4B8A8] line-through">
                      ₹{Math.round(item.price * 1.25)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8E2DA] text-[#6B6560] bg-white hover:border-[#D4CCC2] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-9 h-9 flex items-center justify-center text-xs font-bold text-[#C4B8A8]"
                >
                  ⋯
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
                    p === currentPage
                      ? "bg-[#4A0E1C] text-white border-[#4A0E1C] shadow-md shadow-[#4A0E1C]/20"
                      : "bg-white text-[#2B2422] border-[#E8E2DA] hover:border-[#D4CCC2]"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8E2DA] text-[#6B6560] bg-white hover:border-[#D4CCC2] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}