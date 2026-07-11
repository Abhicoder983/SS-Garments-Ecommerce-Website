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
import { useEffect,useState,useContext, useMemo } from "react"
import { StoreContext } from "../Context/StoreContext.jsx";
import { AuthContext } from "../Context/AuthContext.jsx"
import {useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
const apiUrl = import.meta.env.VITE_API_URL;

export default function Homes() {
  const {  setLogin, token, setToken } = useContext(AuthContext);
  const { openMenu } = useContext(StoreContext);

  const [product, setProduct] = useState({}); // ✅ array
  const [index, setIndex] = useState(0);
  const isMobileOrTablet = window.innerWidth < 1024; // < lg

  const Navigate = useNavigate()

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // ✅ Latest 4 products (sorted)
  const imgArray = useMemo(() => {
    console.log('abhishek1')
    if (!product) return []
    console.log('abhishek2')
    console.log(product)
    return Object.keys(product)

  }, [product]);

  // ✅ Fetch products
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        console.log("abhishekapi")
        console.log(res.data?.productData)
        setProduct(res.data?.productData || {});
        setLogin(res.data.userData);
        setToken(res.data.access_Token);

      } catch (err) {
        console.log(err.response.data?.productData)
        setProduct(err.response?.data?.productData || {});
      
        setToken(null)
        setLogin(null)
      }
    };

    fetchProduct();
  }, []);


const shortText = (text, limit = 120) =>
   text?.length > limit ? text.slice(0, limit) + "..." : text;
  // ✅ Auto slider


  useEffect(() => {
    if (!imgArray.length) return;

    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % imgArray.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [imgArray]);

  /* 🔹 Reusable section title — Fraunces heading + thin gold rule */
  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-4 w-full max-w-5xl mx-auto px-3 py-2">
      <p
        className="text-xl md:text-2xl text-[#2B2422] capitalize whitespace-nowrap"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        {children}
      </p>
      <div className="h-px grow bg-[#DCD0B8]" />
    </div>
  );

    return (
    <>
        <NavBar />
        

  
        {/* home section  */}
        
      <div className={openMenu?'h-[75vh] overflow-y-clip w-auto bg-[#FAF6EF]':'bg-[#FAF6EF]'} style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="h-[80vh] max-w-5xl  mt-1 mx-auto ">
            {/* Image */}
      <div className="relative w-full h-11/12 overflow-hidden bg-[#1C1512] rounded-b-2xl">
  {/* Image */}
  <img
    src={product && imgArray && product?.[imgArray?.[index]]?.[0]?.image}

    alt="slider"
    className="w-8/12 h-full object-content mx-auto bg-[#1C1512] "
  />

  {/* Dark overlay (for readability) */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1512]/85 via-[#1C1512]/35 to-transparent " />

  {/* Text Content */}
  <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-10 text-white">
    
    <h2 className="text-2xl md:text-4xl leading-tight capitalize" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
      {product?.[imgArray?.[index]]?.[0]?.product_name}
    </h2>

    <p className="mt-2 max-w-xl text-sm md:text-base text-white/70 capitalize">
      {shortText(product?.[imgArray?.[index]]?.[0]?.description)}
    </p>

    <div className="mt-4 flex items-center justify-between">
      <span className="text-2xl font-semibold text-[#E8C766]">
        ₹{product?.[imgArray?.[index]]?.[0]?.price}
      </span>

      <button className="bg-[#FAF6EF] text-[#2B2422] px-5 py-2 rounded-full text-sm font-semibold hover:bg-white transition flex items-center gap-1" onClick={()=>{
        Navigate(`/checkout?id=${product?.[imgArray?.[index]]?.[0]?.variant_id}`)
      }}>
        Checkout
        <ChevronRight size={15} />
      </button>
    </div>
  </div>
</div>

      {/* Dots */}
      <div className="flex justify-center my-3 space-x-2">
        {imgArray && imgArray.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              index === i ? "bg-[#B8862E] w-6" : "bg-[#DCD0B8] w-1.5"
            }`}
          ></div>
        ))}
      </div>
    </div>

    <SectionTitle>{imgArray[0]}</SectionTitle>

    <div
  className="grid gap-3 w-full max-w-5xl mx-auto p-3"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[0]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[0]]?.map((item, i) => (
  <div
    key={i}
    className="border border-[#EDE3D3] bg-white p-3 rounded-2xl flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-xl object-contain bg-[#FAF6EF]"
  alt=""
/>

    <h2 className="md:text-xl text-base mt-3 capitalize font-medium text-[#2B2422]">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-base mt-1.5 text-[#8A7F73] first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-base text-sm flex justify-between text-[#9C9082] mt-2">
      <div>{item?.brand}</div>
      <div className="text-base md:text-xl text-[#4A0E1C] font-semibold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex mt-3 grow flex-col md:flex-row gap-2 md:items-end justify-end">
     
      <button className="bg-[#4A0E1C] text-white px-4 py-1.5 text-sm rounded-lg hover:bg-[#3A0B16] transition-colors" onClick={()=>Navigate(`/checkout?id=${item?.variant_id}`)}>
       Checkout
      </button>
    </div>
  </div>
))}
</div>



    <SectionTitle>{imgArray[1]}</SectionTitle>


<div className="max-w-5xl mx-auto p-3 flex overflow-x-scroll gap-3">

    {product[imgArray?.[1]]?.map((item, i) => (
  <div
    key={i}
    className="border border-[#EDE3D3] p-3 rounded-2xl md:w-1/3 w-4/5 bg-white shrink-0"
  >
    <img
  src={item?.image}
  className="h-44  w-full rounded-xl object-contain bg-[#FAF6EF]"
  alt=""
/>

    <h2 className="text-xl mt-3 capitalize font-medium text-[#2B2422]">
      {item?.product_name} 
    </h2>

    <div className="text-base mt-1.5 text-[#8A7F73]  first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="flex justify-between text-[#9C9082] text-base mt-2">
      <div>{item?.brand}</div>
      <div className="text-xl text-[#4A0E1C] font-semibold">
        ₹{item?.price}
      </div>
    </div>

    <div className="flex justify-between mt-3">
    
      <button className="bg-[#4A0E1C] text-white px-4 py-1.5 text-sm rounded-lg hover:bg-[#3A0B16] transition-colors" onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}

</div>

        
       
    
    <div className="w-full h-screen max-w-5xl mx-auto mt-3">
        <img src={latest1} className="w-full h-1/2" alt="" />
        <img src={latest2} className="w-full h-1/2" alt="" />
    </div>
    <div className="py-3 bg-[#4A0E1C] text-[#F5E9C8] text-lg md:text-xl flex justify-around">
      <span className="tracking-[0.5em]">MADE</span>
      <span className="tracking-[0.5em]">WITH</span>
      <span className="tracking-[0.5em]">LOVE</span>
      <span className="tracking-[0.5em]">IN</span>
      <span className="tracking-[0.5em]">INDIA</span>

      

    </div>
    <div className="w-full mx-auto max-w-5xl h-48 flex flex-col justify-center items-center bg-[#F5EFE3]">
      <div>
      <h1 className="text-3xl text-[#2B2422]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Shop The Latest</h1>
      <span className="w-12 h-1 bg-[#B8862E] block ml-auto rounded-xl"></span>
      </div>

    </div>

    <SectionTitle>{imgArray[2]}</SectionTitle>
       <div
  className="grid gap-3 w-full max-w-5xl mx-auto p-3"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[2]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[2]]?.map((item, i) => (
  <div
    key={i}
    className="border border-[#EDE3D3] bg-white p-3 rounded-2xl flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-xl object-contain bg-[#FAF6EF]"
  alt=""
/>

    <h2 className="md:text-xl text-base mt-3 capitalize font-medium text-[#2B2422]">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-base mt-1.5 text-[#8A7F73] first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-base text-sm flex justify-between text-[#9C9082] mt-2">
      <div>{item?.brand}</div>
      <div className="text-base md:text-xl text-[#4A0E1C] font-semibold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex  mt-3 grow flex-col md:flex-row gap-2 md:items-end justify-end">
      
      <button className="bg-[#4A0E1C] text-white px-4 py-1.5 text-sm rounded-lg hover:bg-[#3A0B16] transition-colors" onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
          Checkout
      </button>
    </div>
  </div>
))}
</div>



 {/* jacket */}
    <SectionTitle>{imgArray[3]}</SectionTitle>


<div className="max-w-5xl mx-auto p-3 flex overflow-x-scroll gap-3">

    {product[imgArray?.[3]]?.map((item, i) => (
  <div
    key={i}
    className="border border-[#EDE3D3] p-3 rounded-2xl md:w-1/3 w-4/5 bg-white shrink-0"
  >
    <img
  src={item?.image}
  className="h-44  w-full rounded-xl object-contain bg-[#FAF6EF]"
  alt=""
/>

    <h2 className="text-xl mt-3 capitalize font-medium text-[#2B2422]">
      {item?.product_name} 
    </h2>

    <div className="text-base mt-1.5 text-[#8A7F73]  first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="flex justify-between text-[#9C9082] text-base mt-2">
      <div>{item?.brand}</div>
      <div className="text-xl text-[#4A0E1C] font-semibold">
        ₹{item?.price}
      </div>
    </div>

    <div className="flex justify-between mt-3">
      
      <button className="bg-[#4A0E1C] text-white px-4 py-1.5 text-sm rounded-lg hover:bg-[#3A0B16] transition-colors" onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}

</div>

 







    <div className="h-fit p-6  bg-[#1C1512] max-w-5xl flex justify-evenly mx-auto rounded-2xl my-4">
      <div className="p-2 flex flex-col items-center text-center">
        <img src={india} className="h-16 w-16" alt="" />
        <h3 className="text-white/80 text-sm md:text-base mt-2">HomeGrown<br></br>
        Indian Brand
        </h3>

      </div>

      <div className="p-2 flex flex-col items-center text-center">
        <img src={returnDelivery} className="h-16 w-16" alt="" />
        <h3 className="text-white/80 text-sm md:text-base mt-2 text-center">7 day return<br></br>
        policy
        </h3>

      </div>
    </div>


    <SectionTitle>{imgArray[4]}</SectionTitle>
     <div
  className="grid gap-3 w-full max-w-5xl mx-auto p-3"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[4]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[4]]?.map((item, i) => (
  <div
    key={i}
    className="border border-[#EDE3D3] bg-white p-3 rounded-2xl flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-xl object-contain bg-[#FAF6EF]"
  alt=""
/>

    <h2 className="md:text-xl text-base mt-3 capitalize font-medium text-[#2B2422]">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-base mt-1.5 text-[#8A7F73] first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-base text-sm flex justify-between text-[#9C9082] mt-2">
      <div>{item?.brand}</div>
      <div className="text-base md:text-xl text-[#4A0E1C] font-semibold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex  mt-3 grow flex-col md:flex-row gap-2 md:items-end">
     
      <button className="bg-[#4A0E1C] text-white px-4 py-1.5 text-sm rounded-lg hover:bg-[#3A0B16] transition-colors" onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}
</div>

    

    <div className="max-w-5xl bg-[#F5EFE3] mx-auto min-h-36 flex flex-col items-center justify-center rounded-2xl">
      <div className=" text-[#2B2422] h-40 flex flex-col justify-center">
      <h1 className="text-2xl text-center w-fit h-fit" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}> Exciting Offer</h1>
      <div className="h-1 w-1/4 ml-auto bg-[#B8862E] rounded-2xl"></div>
      </div>

      <img src={offer1} className="w-full object-center rounded-b-2xl"alt="" />



          <SectionTitle>{imgArray[5]}</SectionTitle>


<div className="max-w-5xl mx-auto p-3 flex overflow-x-scroll gap-3">

    {product[imgArray?.[5]]?.map((item, i) => (
  <div
    key={i}
    className="border border-[#EDE3D3] p-3 rounded-2xl md:w-1/3 w-4/5 bg-white shrink-0"
  >
    <img
  src={item?.image}
  className="h-44  w-full rounded-xl object-contain bg-[#FAF6EF]"
  alt=""
/>

    <h2 className="text-xl mt-3 capitalize font-medium text-[#2B2422]">
      {item?.product_name} 
    </h2>

    <div className="text-base mt-1.5 text-[#8A7F73]  first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="flex justify-between text-[#9C9082] text-base mt-2">
      <div>{item?.brand}</div>
      <div className="text-xl text-[#4A0E1C] font-semibold">
        ₹{item?.price}
      </div>
    </div>

    <div className="flex justify-between mt-3">
      
      <button className="bg-[#4A0E1C] text-white px-4 py-1.5 text-sm rounded-lg hover:bg-[#3A0B16] transition-colors" onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}

</div>
      <img src={offer2} className="w-full  object-center" alt="" />

    </div>
    <div className="max-w-5xl text-center mx-auto">
      <h1 className="bg-[#4A0E1C] text-white text-xl md:text-2xl text-center p-6 tracking-[0.15em] rounded-2xl mt-4" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>HOMEGROWN INDIAN BRAND</h1>
          <SectionTitle>{imgArray[6]}</SectionTitle>
     <div
  className="grid gap-3 w-full max-w-5xl mx-auto p-3"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[6]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[6]]?.map((item, i) => (
  <div
    key={i}
    className="border border-[#EDE3D3] bg-white p-3 rounded-2xl flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-xl object-contain bg-[#FAF6EF]"
  alt=""
/>

    <h2 className="md:text-xl text-base mt-3 capitalize font-medium text-[#2B2422]">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-base mt-1.5 text-[#8A7F73] first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-base text-sm flex justify-between text-[#9C9082] mt-2">
      <div>{item?.brand}</div>
      <div className="text-base md:text-xl text-[#4A0E1C] font-semibold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex  mt-3 grow flex-col md:flex-row gap-2 md:items-end">
      
      <button className="bg-[#4A0E1C] text-white px-4 py-1.5 text-sm rounded-lg hover:bg-[#3A0B16] transition-colors" onClick={()=>Navigate(`/checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}
</div>

      <h1 className="bg-[#F5EFE3] text-[#2B2422] text-2xl text-center py-16" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Over <span className="text-[#4A0E1C] font-semibold">1 Million</span> Smiles Delivered</h1>

    </div>

    <Footer />
    </div>


    </>
    )
}
