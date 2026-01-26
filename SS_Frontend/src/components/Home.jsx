import NavBar from "./NavBar"
import Footer from "./Footer"
import latest1 from "../assets/homeAssests/latest/latest1.jpg"
import latest2 from "../assets/homeAssests/latest/latest2.jpg"
import india from "../assets/homeAssests/policy/india.png"
import returnDelivery from "../assets/homeAssests/policy/returnDelivery.png"

import axios from "axios";
import offer1 from "../assets/homeAssests/extraOffer/offer1.jpg"
import offer2 from "../assets/homeAssests/extraOffer/offer2.jpg"
import { useEffect,useState,useContext, useMemo } from "react"
import { StoreContext } from "../Context/StoreContext.jsx";
import { AuthContext } from "../Context/AuthContext.jsx"
import {useNavigate } from "react-router-dom"

export default function Homes() {
  const {  setLogin, token, setToken } = useContext(AuthContext);
  const { openMenu } = useContext(StoreContext);

  const [product, setProduct] = useState({}); // ✅ array
  const [index, setIndex] = useState(0);
  const isMobileOrTablet = window.innerWidth < 1024; // < lg

  const Navigate = useNavigate()

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
        const res = await axios.get("http://localhost:8000", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
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

const addToCart=()=>{
  return 
}
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
    return(
    <>
        <NavBar />
        {/* home section  */}
        
      <div className={openMenu?'h-[75vh] overflow-y-clip w-auto':''}>
        <div className="h-[80vh] max-w-5xl  mt-1 mx-auto ">
            {/* Image */}
      <div className="relative w-full h-11/12 overflow-hidden bg-black">
  {/* Image */}
  <img
    src={product && imgArray && product?.[imgArray?.[index]]?.[0]?.image}

    alt="slider"
    className="w-8/12 h-full object-content mx-auto bg-black "
  />

  {/* Dark overlay (for readability) */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent " />

  {/* Text Content */}
  <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-10 text-white">
    
    <h2 className="text-2xl md:text-4xl font-bold leading-tight capitalize">
      {product?.[imgArray?.[index]]?.[0]?.product_name}
    </h2>

    <p className="mt-2 max-w-xl text-sm md:text-base text-gray-200 capitalize">
      {shortText(product?.[imgArray?.[index]]?.[0]?.description)}
    </p>

    <div className="mt-4 flex items-center justify-between">
      <span className="text-2xl font-semibold text-green-400">
        ₹{product?.[imgArray?.[index]]?.[0]?.price}
      </span>

      <button className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition" onClick={()=>{
        Navigate(`/checkout?id=${product?.[imgArray?.[index]]?.[0]?.variant_id}`)
      }}>
        Checkout
      </button>
    </div>
  </div>
</div>

      {/* Dots */}
      <div className="flex justify-center my-3 space-x-2">
        {imgArray && imgArray.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              index === i ? "bg-gray-700" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>

    <div  className=" gap-2 w-full max-w-5xl mx-auto p-1 flex ">
      <p className=" font-bold text-2xl">{imgArray[0]}</p>
      <div className="h-1 grow rounded-full bg-red-600 mt-5"></div>
    
</div>
    <div
  className="grid gap-2 w-full max-w-5xl mx-auto p-1"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[0]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[0]]?.map((item, i) => (
  <div
    key={i}
    className="border-2 border-red-400 p-1 bg-blend-hard-light rounded-lg flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-lg object-contain bg-gray-100"
  alt=""
/>

    <h2 className="md:text-2xl text-lg   capitalize font-semibold">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-xl mt-4 ml-2 first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-lg text-md flex justify-between text-neutral-500">
      <div>{item?.brand}</div>
      <div className="text-lg md:text-2xl text-orange-600 font-bold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex mt-2 grow flex-col md:flex-row gap-2 md:items-end justify-end">
      <button className="bg-yellow-400 text-white px-2 py-1  rounded-lg" onClick={addToCart}>
        Add to Cart
      </button>
      <button className="bg-green-400 text-white px-2 py-1  rounded-lg " onClick={()=>Navigate(`/checkout?id=${item?.variant_id}`)}>
       Checkout
      </button>
    </div>
  </div>
))}
</div>



    <div  className=" gap-2 w-full max-w-5xl mx-auto p-1 flex ">
      <p className=" font-bold text-2xl">{imgArray[1]}</p>
      <div className="h-1 grow rounded-full bg-amber-600  mt-5"></div>
    
</div>


<div className="max-w-5xl mx-auto p-1 flex overflow-x-scroll gap-1 bg-neutral-100">

    {product[imgArray?.[1]]?.map((item, i) => (
  <div
    key={i}
    className="border-2 border-amber-600 p-1 bg-blend-hard-light rounded-lg md:w-1/3 w-4/5 bg-white"
  >
    <img
  src={item?.image}
  className="h-44  w-full rounded-lg object-contain bg-gray-100"
  alt=""
/>

    <h2 className="text-2xl capitalize font-semibold">
      {item?.product_name} 
    </h2>

    <div className="text-xl mt-4 ml-2 text-neutral-700  first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="flex justify-between text-black text-xl">
      <div>{item?.brand}</div>
      <div className="text-2xl text-orange-600 font-bold">
        ₹{item?.price}
      </div>
    </div>

    <div className="flex justify-between mt-2">
      <button className="bg-yellow-400 text-white px-2 py-1 rounded-lg" onClick={addToCart}>
        Add to Cart
      </button>
      <button className="bg-green-400 text-white px-2 py-1 rounded-lg " onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
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
    <div className="py-2 bg-[#363435] text-white text-xl flex justify-around">
      <span className="tracking-[0.5em]">MADE</span>
      <span className="tracking-[0.5em]">WITH</span>
      <span className="tracking-[0.5em]">LOVE</span>
      <span className="tracking-[0.5em]">IN</span>
      <span className="tracking-[0.5em]">INDIA</span>

      

    </div>
    <div className="w-full mx-auto max-w-5xl h-48 flex flex-col justify-center items-center bg-gray-300">
      <div>
      <h1 className="text-3xl  ">Shop The Latest</h1>
      <span className="w-12 h-1 bg-amber-300 block ml-auto rounded-xl"></span>
      </div>

    </div>

        <div  className=" gap-2 w-full max-w-5xl mx-auto p-1 flex ">
      <p className="text-gray-800 font-bold text-2xl">{imgArray[2]}</p>
      <div className="h-1 grow rounded-full bg-gray-800 mt-5"></div>
    
</div>
       <div
  className="grid gap-2 w-full max-w-5xl mx-auto p-1"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[2]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[2]]?.map((item, i) => (
  <div
    key={i}
    className="border-2 border-red-400 p-1 bg-blend-hard-light rounded-lg flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-lg object-contain bg-gray-100"
  alt=""
/>

    <h2 className="md:text-2xl text-lg   capitalize font-semibold">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-xl mt-4 ml-2 first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-lg text-md flex justify-between text-neutral-500">
      <div>{item?.brand}</div>
      <div className="text-lg md:text-2xl text-orange-600 font-bold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex  mt-2 grow flex-col md:flex-row gap-2 md:items-end justify-end">
      <button className="bg-yellow-400 text-white px-2 py-1  rounded-lg" onClick={addToCart}>
        Add to Cart
      </button>
      <button className="bg-green-400 text-white px-2 py-1  rounded-lg " onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
          Checkout
      </button>
    </div>
  </div>
))}
</div>



 {/* jacket */}
    <div  className=" gap-2 w-full max-w-5xl mx-auto p-1 flex mt-5 ">
      <p className=" font-bold text-2xl">{imgArray[3]}</p>
      <div className="h-1 grow rounded-full bg-orange-900  mt-5"></div>
    
</div>


<div className="max-w-5xl mx-auto p-1 flex overflow-x-scroll gap-1 bg-neutral-100">

    {product[imgArray?.[3]]?.map((item, i) => (
  <div
    key={i}
    className="border-2 border-orange-600 p-1 bg-blend-hard-light rounded-lg md:w-1/3 w-4/5 bg-white"
  >
    <img
  src={item?.image}
  className="h-44  w-full rounded-lg object-contain bg-gray-100"
  alt=""
/>

    <h2 className="text-2xl capitalize font-semibold">
      {item?.product_name} 
    </h2>

    <div className="text-xl mt-4 ml-2 text-neutral-700  first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="flex justify-between text-black text-xl">
      <div>{item?.brand}</div>
      <div className="text-2xl text-orange-600 font-bold">
        ₹{item?.price}
      </div>
    </div>

    <div className="flex justify-between mt-2">
      <button className="bg-yellow-400 text-white px-2 py-1 rounded-lg" onClick={addToCart}>
        Add to Cart
      </button>
      <button className="bg-green-400 text-white px-2 py-1 rounded-lg " onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}

</div>

 







    <div className="h-fit p-3  bg-gray-900 max-w-5xl flex justify-evenly mx-auto">
      <div className="p-2 ">
        <img src={india} className="h-18 w-18" alt="" />
        <h3 className="text-white text-lg">HomeGrown<br></br>
        Indian Brand
        </h3>

      </div>

      <div className="p-2">
        <img src={returnDelivery} className="h-18 w-18" alt="" />
        <h3 className="text-white text-lg text-center">7 day return<br></br>
        policy
        </h3>

      </div>
    </div>


    <div  className=" gap-2 w-full max-w-5xl mx-auto p-1 flex ">
      <p className=" font-bold text-2xl">{imgArray[4]}</p>
      <div className="h-1 grow rounded-full bg-red-600 mt-5"></div>
    
</div>
     <div
  className="grid gap-2 w-full max-w-5xl mx-auto p-1"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[4]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[4]]?.map((item, i) => (
  <div
    key={i}
    className="border-2 border-red-400 p-1 bg-blend-hard-light rounded-lg flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-lg object-contain bg-gray-100"
  alt=""
/>

    <h2 className="md:text-2xl text-lg   capitalize font-semibold">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-xl mt-4 ml-2 first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-lg text-md flex justify-between text-neutral-500">
      <div>{item?.brand}</div>
      <div className="text-lg md:text-2xl text-orange-600 font-bold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex  mt-2 grow flex-col md:flex-row gap-2 md:items-end">
      <button className="bg-yellow-400 text-white px-2 py-1  rounded-lg" onClick={addToCart}>
        Add to Cart
      </button>
      <button className="bg-green-400 text-white px-2 py-1  rounded-lg " onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}
</div>

    

    <div className="max-w-5xl bg-[#EDEDED] mx-auto min-h-36 flex flex-col items-center justify-center">
      <div className=" text-black h-40 flex flex-col justify-center">
      <h1 className="text-2xl text-center w-fit h-fit"> Exciting Offer</h1>
      <div className="h-1 w-1/4 ml-auto bg-amber-400 rounded-2xl"></div>
      </div>

      <img src={offer1} className="w-full object-center"alt="" />



          <div  className=" gap-2 w-full max-w-5xl mx-auto p-1 flex mt-5 ">
      <p className=" font-bold text-2xl">{imgArray[5]}</p>
      <div className="h-1 grow rounded-full bg-teal-600  mt-5"></div>
    
</div>


<div className="max-w-5xl mx-auto p-1 flex overflow-x-scroll gap-1 bg-neutral-100">

    {product[imgArray?.[5]]?.map((item, i) => (
  <div
    key={i}
    className="border-2 border-teal-500 p-1 bg-blend-hard-light rounded-lg md:w-1/3 w-4/5 bg-white"
  >
    <img
  src={item?.image}
  className="h-44  w-full rounded-lg object-contain bg-gray-100"
  alt=""
/>

    <h2 className="text-2xl capitalize font-semibold">
      {item?.product_name} 
    </h2>

    <div className="text-xl mt-4 ml-2 text-neutral-700  first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="flex justify-between text-black text-xl">
      <div>{item?.brand}</div>
      <div className="text-2xl text-orange-600 font-bold">
        ₹{item?.price}
      </div>
    </div>

    <div className="flex justify-between mt-2">
      <button className="bg-yellow-400 text-white px-2 py-1 rounded-lg" onClick={addToCart}>
        Add to Cart
      </button>
      <button className="bg-green-400 text-white px-2 py-1 rounded-lg " onClick={()=>Navigate(`checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}

</div>
      <img src={offer2} className="w-full  object-center" alt="" />

    </div>
    <div className="max-w-5xl text-center mx-auto">
      <h1 className="bg-[#45B6A4] text-2xl text-center p-6">HOMEGROWN INDIAN BRAND</h1>
          <div  className=" gap-2 w-full max-w-5xl mx-auto p-1 flex ">
      <p className=" font-bold text-2xl">{imgArray[6]}</p>
      <div className="h-1 grow rounded-full bg-gray-800 mt-5"></div>
    
</div>
     <div
  className="grid gap-2 w-full max-w-5xl mx-auto p-1"
  style={{
    gridTemplateColumns: `repeat(${isMobileOrTablet
  ? 2
  : Math.ceil(Math.sqrt(product[imgArray?.[6]]?.length))},minmax(0, 1fr))`
  }}
>
        {product[imgArray?.[6]]?.map((item, i) => (
  <div
    key={i}
    className="border-2 border-gray-600 p-1 bg-blend-hard-light rounded-lg flex flex-col"
  >
    <img
  src={item?.image}
  className="md:h-[45vh] h-[30vh] w-full rounded-lg object-contain bg-gray-100"
  alt=""
/>

    <h2 className="md:text-2xl text-lg   capitalize font-semibold">
      {item?.product_name} 
    </h2>

    <div className="text-sm md:text-xl mt-4 ml-2 first-letter:uppercase">
      {shortText(item?.description)}
    </div>

    <div className="md:text-lg text-md flex justify-between text-neutral-500">
      <div>{item?.brand}</div>
      <div className="text-lg md:text-2xl text-orange-600 font-bold">
        ₹{item?.price} 
      </div>
    </div>

    <div className="flex  mt-2 grow flex-col md:flex-row gap-2 md:items-end">
      <button className="bg-yellow-400 text-white px-2 py-1  rounded-lg" onClick={addToCart}>
        Add to Cart
      </button>
      <button className="bg-green-400 text-white px-2 py-1  rounded-lg " onClick={()=>Navigate(`/checkout?id=${item?.variant_id}`)}>
        Checkout
      </button>
    </div>
  </div>
))}
</div>

      <h1 className="bg-neutral-100 text-2xl text-center p-19">Over <span className="font-bold">1 Million</span> Smiles Delivered</h1>

    </div>

    <Footer />
    </div>


    </>
    )
}