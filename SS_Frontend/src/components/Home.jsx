import NavBar from "./NavBar"
import Footer from "./Footer"
import india from "../assets/homeAssests/policy/india.png"
import returnDelivery from "../assets/homeAssests/policy/returnDelivery.png"
import GoogleSignInButton from "./auth/GoogleSignInButton";
import axios from "axios";
import { useEffect, useState, useContext, useMemo, useRef } from "react"
import { StoreContext } from "../Context/StoreContext.jsx";
import { AuthContext } from "../Context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import { ChevronRight, ChevronLeft, ShoppingBag, ArrowRight, Sparkles } from "lucide-react"

const apiUrl = import.meta.env.VITE_API_URL;

const shortText = (text, limit = 120) =>
  text?.length > limit ? text.slice(0, limit) + "..." : text;

const serif = { fontFamily: "'Fraunces', serif", fontWeight: 600 };

// Components live at module scope so React doesn't remount them on every
// render of Homes(). Data they need is passed in as props.

const SectionTitle = ({ children, icon: Icon, count, onViewAll }) => (
  <div className="flex items-end justify-between gap-4 w-full max-w-5xl mx-auto px-4 pt-12 pb-5">
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={18} className="text-[#B8862E] shrink-0" />}
        <h2
          className="text-2xl md:text-3xl text-[#2B2422] capitalize tracking-tight leading-none truncate"
          style={serif}
        >
          {children}
        </h2>
      </div>
      <div className="mt-3 h-[3px] w-12 rounded-full bg-[#B8862E]" />
    </div>

    <div className="flex items-center gap-4 shrink-0">
      {typeof count === "number" && (
        <span className="hidden sm:inline text-sm text-[#9C9082]">{count} styles</span>
      )}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A0E1C]
          hover:text-[#B8862E] transition-colors duration-300 rounded
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8862E]"
        >
          View all
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      )}
    </div>
  </div>
);

const ProductCard = ({ item, layout = "grid", navigate }) => {
  const go = () => navigate(`/checkout?id=${item?.variant_id}`);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`${item?.product_name || "Product"}, ₹${item?.price}`}
      className={`
        group relative bg-white rounded-xl overflow-hidden cursor-pointer
        ring-1 ring-[#EDE3D3] transition-all duration-500 ease-out
        hover:ring-[#DCD0B8] hover:-translate-y-1 hover:shadow-[0_14px_34px_-12px_rgba(74,14,28,0.25)]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862E]
        ${layout === "scroll" ? "md:w-[320px] w-[280px] shrink-0" : "flex flex-col"}
      `}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      }}
    >
      <div className={`relative overflow-hidden bg-[#F5EFE3] ${layout === "scroll" ? "h-52" : "aspect-[4/5]"}`}>
        <img
          src={item?.image}
          loading="lazy"
          className="w-full h-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-105"
          alt={item?.product_name || "Product photo"}
        />

        {/* Buy cue slides up on hover (desktop); always visible on touch via the price row */}
        <div
          className="hidden md:flex absolute inset-x-3 bottom-3 items-center justify-center gap-2
          rounded-full bg-[#4A0E1C] text-[#F5E9C8] text-sm font-semibold py-2.5
          translate-y-[140%] group-hover:translate-y-0 transition-transform duration-500 ease-out"
        >
          <ShoppingBag size={15} />
          Buy now
        </div>
      </div>

      <div className="p-4 flex flex-col grow">
        {item?.brand && (
          <span className="text-xs font-medium text-[#B8862E] mb-1">{item.brand}</span>
        )}

        <h3 className="text-base capitalize font-semibold text-[#2B2422] leading-snug line-clamp-2">
          {item?.product_name}
        </h3>

        <p className="text-sm mt-1.5 text-[#8A7F73] line-clamp-2 leading-relaxed">
          {shortText(item?.description)}
        </p>

        <div className="mt-auto pt-4">
          <span className="text-xl md:text-2xl text-[#4A0E1C]" style={serif}>
            ₹{item?.price}
          </span>
        </div>
      </div>
    </article>
  );
};

// const ScrollSection = ({ categoryIndex, product, imgArray, navigate }) => (
//   <div className="max-w-5xl mx-auto px-4">
//     <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
//       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//       {product[imgArray?.[categoryIndex]]?.map((item, i) => (
//         <div key={i} className="snap-start">
//           <ProductCard item={item} layout="scroll" navigate={navigate} />
//         </div>
//       ))}
//     </div>
//   </div>
// );

const GridSection = ({ categoryIndex, product, imgArray, navigate }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 w-full max-w-5xl mx-auto px-4">
    {product[imgArray?.[categoryIndex]]?.map((item, i) => (
      <ProductCard key={i} item={item} layout="grid" navigate={navigate} />
    ))}
  </div>
);

// ─── Category banner card ───
// Pulls the first product's image from that category as the banner
// photo, so the visuals stay in sync with whatever the backend sends
// back — no hardcoded category list or static images.
const CategoryCard = ({ categoryName, product, navigate, featured = false }) => {
  const items = product[categoryName] || [];
  const bannerImage = items[0]?.image;

  return (
    <button
      onClick={() => navigate(`/products?search=${encodeURIComponent(categoryName)}`)}
      className={`group relative w-full h-full rounded-2xl overflow-hidden text-left
      ring-1 ring-[#EDE3D3] transition-shadow duration-500
      hover:shadow-[0_14px_34px_-12px_rgba(28,21,18,0.45)]
      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862E]
      ${featured ? "col-span-2 row-span-2" : ""}`}
    >
      <div className="absolute inset-0 bg-[#F5EFE3]">
        <img
          src={bannerImage}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1512]/80 via-[#1C1512]/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between gap-3 text-white">
        <div className="min-w-0">
          <span
            className={`block capitalize leading-tight truncate ${featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}
            style={serif}
          >
            {categoryName}
          </span>
          <span className="block text-xs md:text-sm text-white/70 mt-1">
            {items.length} {items.length === 1 ? "style" : "styles"}
          </span>
        </div>
        <span
          className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-[#FAF6EF] text-[#4A0E1C]
          transition-transform duration-300 group-hover:translate-x-1"
        >
          <ArrowRight size={16} />
        </span>
      </div>
    </button>
  );
};

const CategorySection = ({ product, imgArray, navigate }) => {
  if (!imgArray?.length) return null;
  return (
    <div className="max-w-5xl mx-auto px-4 pt-6">
      <div className="pb-5">
        <h2 className="text-2xl md:text-3xl text-[#2B2422] tracking-tight leading-none" style={serif}>
          Shop by category
        </h2>
        <div className="mt-3 h-[3px] w-12 rounded-full bg-[#B8862E]" />
      </div>

      {/* First category gets the large tile; the rest fill around it */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[190px] md:auto-rows-[230px]">
        {imgArray.map((categoryName, i) => (
          <CategoryCard
            key={categoryName}
            categoryName={categoryName}
            product={product}
            navigate={navigate}
            featured={i === 0 && imgArray.length > 2}
          />
        ))}
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="rounded-xl bg-white ring-1 ring-[#EDE3D3] overflow-hidden animate-pulse">
    <div className="aspect-[4/5] bg-[#F5EFE3]" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 w-1/3 bg-[#EDE3D3] rounded" />
      <div className="h-4 w-4/5 bg-[#EDE3D3] rounded" />
      <div className="h-3 w-full bg-[#F5EFE3] rounded" />
      <div className="h-6 w-1/3 bg-[#EDE3D3] rounded mt-4" />
    </div>
  </div>
);

export default function Homes() {
  const { setLogin, token, setToken } = useContext(AuthContext);
  const { openMenu } = useContext(StoreContext);

  const [product, setProduct] = useState({});
  const [index, setIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const Navigate = useNavigate()

  // Loads brand fonts + a couple of small keyframes used for the hero
  // crossfade. Kept local to this component rather than the global
  // stylesheet since this is the only place that needs them.
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes heroReveal {
        from { opacity: 0; transform: scale(1.015); }
        to { opacity: 1; transform: scale(1); }
      }
      .hero-slide { animation: heroReveal 900ms ease both; }
      @keyframes pageIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .page-in { animation: pageIn 600ms ease both; }
      @media (prefers-reduced-motion: reduce) {
        .hero-slide, .page-in { animation: none; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
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

  // Auto-advance the hero continuously, regardless of hover.
  useEffect(() => {
    if (!imgArray.length) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % imgArray.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [imgArray]);

  const goTo = (i) => setIndex(((i % imgArray.length) + imgArray.length) % imgArray.length);

  if (!isLoaded) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-[#FAF6EF] pt-10" style={{ fontFamily: "'Inter', sans-serif" }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="h-8 w-56 rounded bg-[#EDE3D3] animate-pulse mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[190px] md:auto-rows-[230px]">
              <div className="col-span-2 row-span-2 rounded-2xl bg-[#EDE3D3] animate-pulse" />
              <div className="rounded-2xl bg-[#EDE3D3] animate-pulse" />
              <div className="rounded-2xl bg-[#EDE3D3] animate-pulse" />
              <div className="rounded-2xl bg-[#EDE3D3] animate-pulse" />
              <div className="rounded-2xl bg-[#EDE3D3] animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-14">
              {[0, 1, 2, 3].map((n) => <ProductSkeleton key={n} />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  const heroItem = product?.[imgArray?.[index]]?.[0];

  return (
    <>
      <NavBar />

      <div className={openMenu ? 'h-[75vh] overflow-y-clip w-auto bg-[#FAF6EF]' : 'bg-[#FAF6EF]'} style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ─── Hero Slider ─── */}
        {/* <div className="max-w-5xl mt-1 mx-auto px-4"> */}
          {/* <div className="relative w-full h-[70vh] md:h-[75vh] overflow-hidden bg-[#1C1512] rounded-b-3xl shadow-2xl">
            <img
              key={index}
              src={heroItem?.image}
              alt={heroItem?.product_name || "Featured product"}
              className="hero-slide w-8/12 h-full object-contain mx-auto bg-[#1C1512]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1512]/90 via-[#1C1512]/30 to-transparent" />

            <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12 text-white">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-widest uppercase bg-[#B8862E]/20 text-[#E8C766] rounded-full border border-[#B8862E]/30">
                  Featured
                </span>
                <h2 className="text-3xl md:text-5xl leading-tight capitalize" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                  {heroItem?.product_name}
                </h2>
                <p className="mt-3 max-w-lg text-sm md:text-base text-white/60 leading-relaxed capitalize">
                  {shortText(heroItem?.description)}
                </p>
                <div className="mt-6 flex items-center gap-6">
                  <span className="text-3xl font-bold text-[#E8C766]">
                    ₹{heroItem?.price}
                  </span>
                  <button
                    className="bg-[#FAF6EF] text-[#2B2422] px-6 py-3 rounded-full text-sm font-semibold 
                    hover:bg-white hover:shadow-lg hover:shadow-white/10 transition-all duration-300 
                    flex items-center gap-2 active:scale-95
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8C766]"
                    onClick={() => Navigate(`/checkout?id=${heroItem?.variant_id}`)}
                  >
                    Checkout Now
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div> */}

            {/* Prev / next controls, shown once there's something to move between
            {imgArray.length > 1 && (
              <>
                <button
                  aria-label="Previous slide"
                  onClick={() => goTo(index - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/80
                  hover:bg-black/35 hover:text-white transition-colors duration-300
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8C766]"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  aria-label="Next slide"
                  onClick={() => goTo(index + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white/80
                  hover:bg-black/35 hover:text-white transition-colors duration-300
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8C766]"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Numbered slide rail — a real sequence, so numerals earn their place here */}
          {/* {imgArray.length > 1 && (
            <div className="flex justify-center items-center gap-1 my-4">
              {imgArray.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Show slide ${i + 1} of ${imgArray.length}`}
                  aria-current={index === i}
                  className={`relative px-2 py-1.5 text-xs tracking-wide transition-colors duration-300 rounded-full
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B8862E]
                  ${index === i ? "text-[#4A0E1C] font-semibold" : "text-[#C4B8A2] hover:text-[#8A7F73]"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                  {index === i && (
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-0 h-[2px] w-4 bg-[#B8862E] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )} */} 
        {/* </div> */}

        <div className="page-in">
        {/* ─── Category Banners (dynamic, from backend categories) ─── */}
        <CategorySection product={product} imgArray={imgArray} navigate={Navigate} />

        {/* ─── Category 0 ─── */}
        {imgArray[0] && (
          <SectionTitle
            icon={Sparkles}
            count={product[imgArray[0]]?.length}
            onViewAll={() => Navigate(`/products?search=${encodeURIComponent(imgArray[0])}`)}
          >
            {imgArray[0]}
          </SectionTitle>
        )}
        {imgArray[0] && <GridSection categoryIndex={0} product={product} imgArray={imgArray} navigate={Navigate} />}

        {/* ─── Category 1 ─── */}
        {imgArray[1] && (
          <SectionTitle
            count={product[imgArray[1]]?.length}
            onViewAll={() => Navigate(`/products?search=${encodeURIComponent(imgArray[1])}`)}
          >
            {imgArray[1]}
          </SectionTitle>
        )}
        {imgArray[1] && <GridSection categoryIndex={1} product={product} imgArray={imgArray} navigate={Navigate} />}

       


        {/* ─── Made in India Banner ─── */}
        <div className="mt-16 py-8 bg-[#4A0E1C] text-[#F5E9C8] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]" />
          <div className="max-w-5xl mx-auto px-4 relative z-10 flex items-center justify-center gap-5">
            <span className="hidden sm:block h-px w-16 bg-[#B8862E]/60" />
            <p className="text-xl md:text-3xl text-center leading-snug" style={serif}>
              Made with love in India
            </p>
            <span className="hidden sm:block h-px w-16 bg-[#B8862E]/60" />
          </div>
        </div>

        {/* ─── Shop The Latest ─── */}
        <div className="w-full mx-auto max-w-5xl px-4 mt-12">
          <div className="rounded-2xl bg-[#F5EFE3] ring-1 ring-[#EDE3D3] px-6 py-10 md:py-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#DCD0B8]/25 via-transparent to-[#B8862E]/10" />
            <div className="relative z-10 max-w-md">
              <h1 className="text-3xl md:text-5xl text-[#2B2422] leading-tight tracking-tight" style={serif}>
                Shop the latest
              </h1>
              <div className="w-16 h-[3px] bg-[#B8862E] mt-4 rounded-full" />
              <p className="mt-4 text-[#8A7F73] text-sm md:text-base leading-relaxed">
                Our newest arrivals, added this season.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Category 2 ─── */}
        {imgArray[2] && (
          <SectionTitle
            count={product[imgArray[2]]?.length}
            onViewAll={() => Navigate(`/products?search=${encodeURIComponent(imgArray[2])}`)}
          >
            {imgArray[2]}
          </SectionTitle>
        )}
        {imgArray[2] && <GridSection categoryIndex={2} product={product} imgArray={imgArray} navigate={Navigate} />}

        {/* ─── Category 3 ─── */}
        {imgArray[3] && (
          <SectionTitle
            count={product[imgArray[3]]?.length}
            onViewAll={() => Navigate(`/products?search=${encodeURIComponent(imgArray[3])}`)}
          >
            {imgArray[3]}
          </SectionTitle>
        )}
        {imgArray[3] && <GridSection categoryIndex={3} product={product} imgArray={imgArray} navigate={Navigate} />}

        

        {/* ─── Category 4 ─── */}
        {imgArray[4] && (
          <SectionTitle
            count={product[imgArray[4]]?.length}
            onViewAll={() => Navigate(`/products?search=${encodeURIComponent(imgArray[4])}`)}
          >
            {imgArray[4]}
          </SectionTitle>
        )}
        {imgArray[4] && <GridSection categoryIndex={4} product={product} imgArray={imgArray} navigate={Navigate} />}

        
       

        {/* ─── Homegrown Banner ─── */}
        <div className="max-w-5xl mx-auto">
          

          {/* ─── Category 6 ─── */}
          {imgArray[6] && (
            <SectionTitle
              count={product[imgArray[6]]?.length}
              onViewAll={() => Navigate(`/products?search=${encodeURIComponent(imgArray[6])}`)}
            >
              {imgArray[6]}
            </SectionTitle>
          )}
          {imgArray[6] && <GridSection categoryIndex={6} product={product} imgArray={imgArray} navigate={Navigate} />}

          
        </div>

        <div className="h-16" />
        </div>

        <Footer />
      </div>
    </>
  )
}