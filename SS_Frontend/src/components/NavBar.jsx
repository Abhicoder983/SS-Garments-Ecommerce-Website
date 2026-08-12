import menu from "../assets/homeAssests/navBar/menu.png";
import close from "../assets/homeAssests/navBar/close.png";
import discount from "../assets/homeAssests/navBar/discount.png";
import account from "../assets/homeAssests/navBar/account.png";
import searchImage from "../assets/homeAssests/navBar/search.png";
import cart from "../assets/homeAssests/navBar/cart.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../Context/StoreContext.jsx";
import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Home,
  ShoppingBag,
  Info,
  Phone,
  FileText,
  RotateCcw,
  Truck,
  Banknote,
  ShieldCheck,
  Ship,
  XCircle,
  ChevronRight,
  Search,
} from "lucide-react";

export default function NavBar() {
  const { openMenu, setOpenMenu } = useContext(StoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(false);
  }, [location.pathname, setOpenMenu]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (search.trim()) {
        const params = new URLSearchParams();
        params.set("search", search.trim());
        setSearchParams(params);
        navigate(`/products?${params.toString()}`);
      } else {
        toast.warning("Enter something to search");
      }
    }
  };

  const handleSearchClick = () => {
    if (search.trim()) {
      const params = new URLSearchParams();
      params.set("search", search.trim());
      setSearchParams(params);
      navigate(`/products?${params.toString()}`);
    } else {
      toast.warning("Enter something to search");
    }
  };

  const mainLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Shop", path: "/products", icon: ShoppingBag },
    { label: "About", path: "/aboutus", icon: Info },
    { label: "Contact", path: "/contactus", icon: Phone },
  ];

  const policyLinks = [
    { label: "Return Policy", path: "/returns", icon: RotateCcw },
    { label: "Delivery Policy", path: "/delivery", icon: Truck },
    { label: "Refund Policy", path: "/refunds", icon: Banknote },
    { label: "Privacy Policy", path: "/privacy", icon: ShieldCheck },
    { label: "Shipping Policy", path: "/shipping", icon: Ship },
    { label: "Cancellation Policy", path: "/cancellation", icon: XCircle },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 w-full z-[70] transition-all duration-300 ${
          scrolled
            ? "bg-[#2B2422]/95 backdrop-blur-xl shadow-md shadow-black/20"
            : "bg-[#2B2422]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-11 sm:h-12 flex items-center justify-between gap-3">
          {/* Left: Menu + Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setOpenMenu((prev) => !prev)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
              aria-label="Toggle menu"
            >
              <img
                src={openMenu ? close : menu}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 brightness-0 invert"
                alt="menu"
              />
            </button>

            <Link
              to="/"
              className="text-sm sm:text-lg font-bold text-white tracking-tight hover:text-[#FDF6ED] transition-colors"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              SS Garments
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search
                  size={14}
                  className="text-[#9A9187] group-focus-within:text-[#4A0E1C] transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-9 py-1.5 rounded-lg bg-white/95 border border-transparent focus:border-[#4A0E1C] focus:bg-white text-xs sm:text-sm text-[#2B2422] placeholder:text-[#C4B8A8] outline-none transition-all duration-200"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                value={search}
              />
              <button
                onClick={handleSearchClick}
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
              >
                <img
                  src={searchImage}
                  className="w-3.5 h-3.5 brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                  alt="search"
                />
              </button>
            </div>
          </div>

          {/* Right: Icons - NO BOX, WHITE, SMALL */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => navigate("/offers")}
              className="relative group"
              aria-label="Offers"
            >
              <img
                src={discount}
                className="w-4 h-4 sm:w-5 sm:h-5 brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                alt="offers"
              />
              <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                %
              </span>
            </button>

            <Link to="/cart" className="group" aria-label="Cart">
              <img
                src={cart}
                className="w-4 h-4 sm:w-5 sm:h-5 brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                alt="cart"
              />
            </Link>

            <Link to="/account" className="group" aria-label="Account">
              <img
                src={account}
                className="w-4 h-4 sm:w-5 sm:h-5 brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                alt="account"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          openMenu ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-[#2B2422]/70 backdrop-blur-sm transition-opacity duration-300 ${
            openMenu ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpenMenu(false)}
        />

        <div
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-[#FAF8F5] shadow-2xl transform transition-transform duration-300 ease-out ${
            openMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="bg-[#2B2422] px-5 py-3.5 flex items-center justify-between">
            <h2
              className="text-base text-white font-bold tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              SS Garments
            </h2>
            <button
              onClick={() => setOpenMenu(false)}
              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <img
                src={close}
                className="w-3.5 h-3.5 brightness-0 invert"
                alt="close"
              />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-3rem)] p-4 space-y-5">
            <div>
              <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-[0.2em] mb-2 px-1">
                Menu
              </p>
              <ul className="space-y-1">
                {mainLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-[#4A0E1C] text-white"
                            : "text-[#2B2422] hover:bg-[#F5F0E8]"
                        }`}
                      >
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>

            </div>
              <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-[0.2em] mb-2 px-1">
                Terms And Conditions
              </p>
              <ul className="space-y-1">
                <li>
                  <Link to="/terms" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === "/terms" ? "bg-[#4A0E1C] text-white" : "text-[#2B2422] hover:bg-[#F5F0E8]"}`}>
                    <FileText size={16} strokeWidth={location.pathname === "/terms" ? 2.5 : 2} />
                    Terms and Conditions  
                  </Link>
                </li>
              </ul>

              <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-[0.2em] mb-2 px-1">
               Payment Flow
              </p>
              <ul className="space-y-1">
                <li>
                  <Link to="/payment-flow" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === "/payment-flow" ? "bg-[#4A0E1C] text-white" : "text-[#2B2422] hover:bg-[#F5F0E8]"}`}>
                    <FileText size={16} strokeWidth={location.pathname === "/payment-flow" ? 2.5 : 2} />
                    Payment Flow
                  </Link>
                </li>
              </ul>
          

            <div>
              <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-[0.2em] mb-2 px-1">
                Policies
              </p>
              <ul className="space-y-1">
                {policyLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-[#4A0E1C] text-white"
                            : "text-[#2B2422] hover:bg-[#F5F0E8]"
                        }`}
                      >
                        <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#4A0E1C] to-[#6B1B2B] rounded-2xl p-4 text-white">
              <FileText size={16} className="mb-1.5 opacity-80" />
              <h4 className="font-bold text-sm mb-1">Need Help?</h4>
              <p className="text-xs text-white/70 mb-3">
                Read our policies or contact support.
              </p>
              <Link
                to="/contactus"
                className="inline-flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Contact Us
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}