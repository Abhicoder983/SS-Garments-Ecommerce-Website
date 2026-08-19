import NavBar from "./NavBar"
import Footer from "./Footer"
import latest1 from "../assets/homeAssests/latest/latest1.jpg"
import latest2 from "../assets/homeAssests/latest/latest2.jpg"
import india from "../assets/homeAssests/policy/india.png"
import returnDelivery from "../assets/homeAssests/policy/returnDelivery.png"
import GoogleSignInButton from "./auth/GoogleSignInButton";
import axios from "axios";
import offer1 from "../assets/homeAssests/extraOffer/offer1.jpg"
import offer2 from "../assets/homeAssests/extraOffer/offer2.jpg"
import { useEffect, useState, useContext, useMemo } from "react"
import { StoreContext } from "../Context/StoreContext.jsx";
import { AuthContext } from "../Context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import { ChevronRight, ShoppingBag, ArrowRight, Sparkles } from "lucide-react"

const apiUrl = import.meta.env.VITE_API_URL;

export default function Homes() {
  const { setLogin, token, setToken } = useContext(AuthContext);
  const { openMenu } = useContext(StoreContext);

  const [product, setProduct] = useState({});
  const [index, setIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobileOrTablet = window.innerWidth < 1024;

  const Navigate = useNavigate()

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const imgArray = useMemo(() => {
    if (!product) return []
    return Object.keys(product)
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          xsrfCookieName: 'csrftoken',
          xsrfHeaderName: 'X-CSRFToken',
          withXSRFToken: true,
        });
        setProduct(res.data?.productData || {});
        setLogin(res.data.userData);
        setToken(res.data.access_Token);
        setIsLoaded(true);
      } catch (err) {
        setProduct(err.response?.data?.productData || {});
        setToken(null)
        setLogin(null)
        setIsLoaded(true);
      }
    };
    fetchProduct();
  }, []);


  const shortText = (text, limit = 120) =>
    text?.length > limit ? text.slice(0, limit) + "..." : text;

  useEffect(() => {
    if (!imgArray.length) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % imgArray.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [imgArray]);

  const SectionTitle = ({ children, icon: Icon }) => (
    <div className="flex items-center gap-4 w-full max-w-5xl mx-auto px-4 py-6">
      {Icon && <Icon size={20} className="text-[#B8862E] shrink-0" />}
      <p
        className="text-lg md:text-2xl text-[#2B2422] capitalize whitespace-nowrap tracking-tight"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        {children}
      </p>
      <div className="h-px grow bg-gradient-to-r from-[#DCD0B8] to-transparent" />
    </div>
  );

  const ProductCard = ({ item, layout = "grid" }) => (
    <div
      className={`
        group relative border border-[#EDE3D3] bg-white rounded-2xl overflow-hidden
        transition-all duration-500 ease-out
        hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#DCD0B8] hover:-translate-y-1
        ${layout === "scroll" ? "md:w-[320px] w-[280px] shrink-0" : "flex flex-col"}
      `}
    >
      <div className={`relative overflow-hidden bg-[#FAF6EF] ${layout === "scroll" ? "h-52" : "md:h-[45vh] h-[30vh]"}`}>
        <img
          src={item?.image}
          className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          alt={item?.product_name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-4 flex flex-col grow">
        <h2 className="md:text-lg text-base capitalize font-semibold text-[#2B2422] leading-snug">
          {item?.product_name}
        </h2>

        <p className="text-sm mt-1.5 text-[#8A7F73] line-clamp-2 leading-relaxed">
          {shortText(item?.description)}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5EFE3]">
          <span className="text-xs font-medium text-[#9C9082] uppercase tracking-wider">
            {item?.brand}
          </span>
          <span className="text-lg md:text-xl text-[#4A0E1C] font-bold">
            ₹{item?.price}
          </span>
        </div>

        <button
          className="mt-4 w-full bg-[#4A0E1C] text-white px-4 py-2.5 text-sm font-medium rounded-xl 
          hover:bg-[#3A0B16] active:scale-[0.98] transition-all duration-300 
          flex items-center justify-center gap-2 group/btn"
          onClick={() => Navigate(`/checkout?id=${item?.variant_id}`)}
        >
          <ShoppingBag size={15} />
          Checkout
          <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );

  const ScrollSection = ({ categoryIndex }) => (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {product[imgArray?.[categoryIndex]]?.map((item, i) => (
          <div key={i} className="snap-start">
            <ProductCard item={item} layout="scroll" />
          </div>
        ))}
      </div>
    </div>
  );

  const GridSection = ({ categoryIndex }) => (
    <div
      className="grid gap-4 w-full max-w-5xl mx-auto px-4"
      style={{
        gridTemplateColumns: `repeat(${isMobileOrTablet
          ? 2
          : Math.min(Math.ceil(Math.sqrt(product[imgArray?.[categoryIndex]]?.length || 1)), 4)}, minmax(0, 1fr))`
      }}
    >
      {product[imgArray?.[categoryIndex]]?.map((item, i) => (
        <ProductCard key={i} item={item} layout="grid" />
      ))}
    </div>
  );

  if (!isLoaded) {
    return (
      <>
        <NavBar />
        <div className="h-screen bg-[#FAF6EF] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-[#DCD0B8] border-t-[#4A0E1C] rounded-full animate-spin" />
            <p className="text-[#8A7F73] text-sm font-medium tracking-wide">Loading your experience...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <div className={openMenu ? 'h-[75vh] overflow-y-clip w-auto bg-[#FAF6EF]' : 'bg-[#FAF6EF]'} style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* ─── Hero Slider ─── */}
        <div className="h-[80vh] max-w-5xl mt-1 mx-auto px-4">
          <div className="relative w-full h-11/12 overflow-hidden bg-[#1C1512] rounded-b-3xl shadow-2xl">
            <img
              src={product && imgArray && product?.[imgArray?.[index]]?.[0]?.image}
              alt="slider"
              className="w-8/12 h-full object-contain mx-auto bg-[#1C1512] transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1512]/90 via-[#1C1512]/30 to-transparent" />

            <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12 text-white">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-widest uppercase bg-[#B8862E]/20 text-[#E8C766] rounded-full border border-[#B8862E]/30">
                  Featured
                </span>
                <h2 className="text-3xl md:text-5xl leading-tight capitalize" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                  {product?.[imgArray?.[index]]?.[0]?.product_name}
                </h2>
                <p className="mt-3 max-w-lg text-sm md:text-base text-white/60 leading-relaxed capitalize">
                  {shortText(product?.[imgArray?.[index]]?.[0]?.description)}
                </p>
                <div className="mt-6 flex items-center gap-6">
                  <span className="text-3xl font-bold text-[#E8C766]">
                    ₹{product?.[imgArray?.[index]]?.[0]?.price}
                  </span>
                  <button
                    className="bg-[#FAF6EF] text-[#2B2422] px-6 py-3 rounded-full text-sm font-semibold 
                    hover:bg-white hover:shadow-lg hover:shadow-white/10 transition-all duration-300 
                    flex items-center gap-2 active:scale-95"
                    onClick={() => Navigate(`/checkout?id=${product?.[imgArray?.[index]]?.[0]?.variant_id}`)}
                  >
                    Checkout Now
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center my-4 space-x-2">
            {imgArray && imgArray.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === i ? "bg-[#B8862E] w-8" : "bg-[#DCD0B8] w-1.5 hover:bg-[#B8862E]/50"}`}
              />
            ))}
          </div>
        </div>

        {/* ─── Category 0 ─── */}
        {imgArray[0] && <SectionTitle icon={Sparkles}>{imgArray[0]}</SectionTitle>}
        {imgArray[0] && <GridSection categoryIndex={0} />}

        {/* ─── Category 1 ─── */}
        {imgArray[1] && <SectionTitle>{imgArray[1]}</SectionTitle>}
        {imgArray[1] && <ScrollSection categoryIndex={1} />}

        {/* ─── Latest Banner ─── */}
        <div className="w-full max-w-5xl mx-auto mt-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 rounded-3xl overflow-hidden shadow-lg">
            <div className="relative h-64 md:h-80 group overflow-hidden">
              <img src={latest1} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="relative h-64 md:h-80 group overflow-hidden">
              <img src={latest2} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* ─── Made in India Banner ─── */}
        <div className="mt-8 py-5 bg-[#4A0E1C] text-[#F5E9C8] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]" />
          <div className="max-w-5xl mx-auto flex justify-around items-center relative z-10">
            {['MADE', 'WITH', 'LOVE', 'IN', 'INDIA'].map((word, i) => (
              <span key={i} className="tracking-[0.5em] text-sm md:text-lg font-medium">{word}</span>
            ))}
          </div>
        </div>

        {/* ─── Shop The Latest ─── */}
        <div className="w-full mx-auto max-w-5xl h-56 flex flex-col justify-center items-center bg-[#F5EFE3] relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-[#DCD0B8]/20 via-transparent to-[#B8862E]/10" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-3xl md:text-4xl text-[#2B2422]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
              Shop The Latest
            </h1>
            <div className="w-16 h-1 bg-[#B8862E] mx-auto mt-3 rounded-full" />
            <p className="mt-3 text-[#8A7F73] text-sm">Discover our newest arrivals curated just for you</p>
          </div>
        </div>

        {/* ─── Category 2 ─── */}
        {imgArray[2] && <SectionTitle>{imgArray[2]}</SectionTitle>}
        {imgArray[2] && <GridSection categoryIndex={2} />}

        {/* ─── Category 3 ─── */}
        {imgArray[3] && <SectionTitle>{imgArray[3]}</SectionTitle>}
        {imgArray[3] && <ScrollSection categoryIndex={3} />}

        {/* ─── Trust Badges ─── */}
        <div className="max-w-5xl mx-auto px-4 my-8">
          <div className="bg-[#1C1512] rounded-3xl p-8 flex flex-col md:flex-row justify-evenly items-center gap-8 shadow-xl">
            <div className="flex flex-col items-center text-center group">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:scale-105">
                <img src={india} className="h-14 w-14 object-contain" alt="" />
              </div>
              <h3 className="text-white/80 text-sm md:text-base mt-4 font-medium leading-relaxed">
                HomeGrown<br />Indian Brand
              </h3>
            </div>
            <div className="hidden md:block w-px h-20 bg-white/10" />
            <div className="flex flex-col items-center text-center group">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:scale-105">
                <img src={returnDelivery} className="h-14 w-14 object-contain" alt="" />
              </div>
              <h3 className="text-white/80 text-sm md:text-base mt-4 font-medium leading-relaxed">
                7 Day Return<br />Policy
              </h3>
            </div>
          </div>
        </div>

        {/* ─── Category 4 ─── */}
        {imgArray[4] && <SectionTitle>{imgArray[4]}</SectionTitle>}
        {imgArray[4] && <GridSection categoryIndex={4} />}

        {/* ─── Exciting Offer ─── */}
        <div className="max-w-5xl bg-[#F5EFE3] mx-auto min-h-36 flex flex-col items-center justify-center rounded-3xl overflow-hidden shadow-sm my-8 mx-4 md:mx-auto">
          <div className="text-[#2B2422] h-40 flex flex-col justify-center items-center px-4">
            <h1 className="text-2xl md:text-3xl text-center" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
              Exciting Offers
            </h1>
            <div className="h-1 w-20 bg-[#B8862E] rounded-full mt-2" />
          </div>
          <img src={offer1} className="w-full object-center rounded-b-3xl hover:scale-[1.02] transition-transform duration-700" alt="" />

          {/* ─── Category 5 ─── */}
          {imgArray[5] && <div className="w-full px-4 mt-6"><SectionTitle>{imgArray[5]}</SectionTitle></div>}
          {imgArray[5] && <div className="px-4 w-full"><ScrollSection categoryIndex={5} /></div>}

          <img src={offer2} className="w-full object-center mt-6 hover:scale-[1.02] transition-transform duration-700" alt="" />
        </div>

        {/* ─── Homegrown Banner ─── */}
        <div className="max-w-5xl text-center mx-auto px-4">
          <h1 className="bg-[#4A0E1C] text-white text-xl md:text-2xl text-center p-8 tracking-[0.15em] rounded-3xl shadow-lg" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            HOMEGROWN INDIAN BRAND
          </h1>

          {/* ─── Category 6 ─── */}
          {imgArray[6] && <SectionTitle>{imgArray[6]}</SectionTitle>}
          {imgArray[6] && <GridSection categoryIndex={6} />}

          <div className="bg-[#F5EFE3] rounded-3xl py-20 px-4 mt-8 mb-8">
            <h1 className="text-[#2B2422] text-2xl md:text-3xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
              Over <span className="text-[#4A0E1C] font-bold">1 Million</span> Smiles Delivered
            </h1>
            <p className="mt-3 text-[#8A7F73] text-sm">Thank you for being part of our journey</p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}