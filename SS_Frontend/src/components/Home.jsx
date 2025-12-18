import NavBar from "./NavBar"
import Footer from "./Footer"
import Tshirt1  from "../assets/homeAssests/slider/Tshirt1.jpg"
import Tshirt2  from "../assets/homeAssests/slider/Tshirt2.jpg"
import Tshirt3  from "../assets/homeAssests/slider/Tshirt3.jpg"
import Tshirt4  from "../assets/homeAssests/slider/Tshirt4.jpg"
import Jeans from "../assets/homeAssests/features/jeans.jpg"
import Tshirt from "../assets/homeAssests/features/Tshirt.jpg"
import Trousers from "../assets/homeAssests/features/trousers.jpg"
import latest1 from "../assets/homeAssests/latest/latest1.jpg"
import latest2 from "../assets/homeAssests/latest/latest2.jpg"
import slide1 from "../assets/homeAssests/slider2/slide1.jpg" 
import slide2 from "../assets/homeAssests/slider2/slide2.jpg" 
import slide3 from "../assets/homeAssests/slider2/slide3.jpg" 
import slide4 from "../assets/homeAssests/slider2/slide4.jpg" 
import slide5 from "../assets/homeAssests/slider2/slide5.jpg" 
import india from "../assets/homeAssests/policy/india.png"
import returnDelivery from "../assets/homeAssests/policy/returnDelivery.png"

import axios from "axios";
import offer1 from "../assets/homeAssests/extraOffer/offer1.jpg"
import offer2 from "../assets/homeAssests/extraOffer/offer2.jpg"
import { useEffect,useState,useContext } from "react"
import { StoreContext } from "../Context/StoreContext.jsx";

export default function Homes(){
    const imgArray=[Tshirt1, slide2,slide3, Tshirt4]
    const [index, setIndex] = useState(0);
    const openMenu = useContext(StoreContext).openMenu;

    useEffect(() => {
    axios.get('http://127.0.0.1:8000/')
    
    const interval = setInterval(() => {
     setIndex((prev) => (prev + 1) % imgArray.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
    return(
    <>
        <NavBar />
        {/* home section  */}
        
      <div className={openMenu?'h-[75vh] overflow-y-clip w-auto':''}>
        <div className="h-[80vh] max-w-5xl   mx-auto ">
            {/* Image */}
      <img
        src={imgArray[index]}
        alt="slider"
        className="w-full h-11/12 mx-auto "
      />

      {/* Dots */}
      <div className="flex justify-center my-3 space-x-2">
        {imgArray.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              index === i ? "bg-gray-700" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>

    <div className="w-full max-w-5xl grid md:grid-cols-3 md:grid-rows-2 grid-cols-2 grid-rows-3 gap-2  mx-auto p-1 ">
        <div>
          <img src={Tshirt}  className="h-56 w-full  rounded-lg" alt="" />
        </div>
        <div>
          <img src={Trousers} className="h-56 w-full rounded-lg" alt="" />
        </div>
        <div>
          <img src={Jeans} className="h-56 w-full rounded-lg" alt="" />
        </div>
        <div>
          <img src={Tshirt} className="h-56 w-full rounded-lg" alt="" />
        </div>
        <div >
          <img src={Trousers} className="h-56 w-full rounded-lg" alt="" />
        </div>
        <div>
          <img src={Jeans} className="h-56 w-full rounded-lg" alt="" />
        </div>
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
    <div className="h-fit p-1 max-w-5xl mt-2 
                flex gap-2 
                mx-auto overflow-x-clip overflow-y-hidden 
                whitespace-nowrap scroll-smooth">

  {/* CARD 1 */}
  <div className="md:min-w-1/4 min-w-1/2 flex-shrink-0 
                  p-1 shadow-md hover:shadow-xl hover:scale-105 
                  rounded-2xl transition-all duration-200 bg-white">
                  
    <img src={slide1} className="w-full h-64 rounded-xl" alt="" />
    <h3 className="pl-4 my-3 text-red-500">New Arrival</h3>

    <div className="flex justify-between mx-1">
      <div>
        <h3 className="line-through px-2 text-red-500 inline-block">334</h3>
        <span>179</span>
      </div>
      <div className="bg-red-700 text-white px-2 py-1 rounded-md text-sm">
        40% OFF
      </div>
    </div>
  </div>

  {/* CARD 2 */}
  <div className="md:min-w-1/4 min-w-1/2 flex-shrink-0 
                  p-1 shadow-md hover:shadow-xl hover:scale-105 
                  rounded-2xl transition-all duration-200 bg-white ">

    <img src={slide2} className="w-full h-64 rounded-xl" alt="" />
    <h3 className="pl-4 my-3 text-red-500">New Arrival</h3>

    <div className="flex justify-between mx-1">
      <div>
        <h3 className="line-through px-2 text-red-500 inline-block">334</h3>
        <span>179</span>
      </div>
      <div className="bg-red-700 text-white px-2 py-1 rounded-md text-sm">
        40% OFF
      </div>
    </div>
  </div>

  {/* CARD 3 */}
  <div className="md:min-w-1/4 min-w-1/2 flex-shrink-0 
                  p-1 shadow-md hover:shadow-xl hover:scale-105 
                  rounded-2xl transition-all duration-200 bg-white">

    <img src={slide3} className="w-full h-64 rounded-xl" alt="" />
    <h3 className="pl-4 my-3 text-red-500">New Arrival</h3>

    <div className="flex justify-between mx-1">
      <div>
        <h3 className="line-through px-2 text-red-500 inline-block">334</h3>
        <span>179</span>
      </div>
      <div className="bg-red-700 text-white px-2 py-1 rounded-md text-sm">
        40% OFF
      </div>
    </div>
  </div>

  {/* CARD 4 */}
  <div className="md:min-w-1/4 min-w-1/2 flex-shrink-0 
                  p-1 shadow-md hover:shadow-xl hover:scale-105 
                  rounded-2xl transition-all duration-200 bg-white">

    <img src={slide4} className="w-full h-64 rounded-xl" alt="" />
    <h3 className="pl-4 my-3 text-red-500">New Arrival</h3>

    <div className="flex justify-between mx-1">
      <div>
        <h3 className="line-through px-2 text-red-500 inline-block">334</h3>
        <span>179</span>
      </div>
      <div className="bg-red-700 text-white px-2 py-1 rounded-md text-sm">
        40% OFF
      </div>
    </div>
  </div>

  {/* CARD 5 */}
  <div className="md:min-w-1/4 min-w-1/2 flex-shrink-0 
                  p-1 shadow-md hover:shadow-xl hover:scale-105 
                  rounded-2xl transition-all duration-200 bg-white">

    <img src={slide5} className="w-full h-64 rounded-xl" alt="" />
    <h3 className="pl-4 my-3 text-red-500">New Arrival</h3>

    <div className="flex justify-between mx-1">
      <div>
        <h3 className="line-through px-2 text-red-500 inline-block">334</h3>
        <span>179</span>
      </div>
      <div className="bg-red-700 text-white px-2 py-1 rounded-md text-sm">
        40% OFF
      </div>
    </div>
  </div>

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

    <div className="max-w-5xl bg-[#EDEDED] mx-auto min-h-36 flex flex-col items-center justify-center">
      <div className=" text-black h-40 flex flex-col justify-center">
      <h1 className="text-2xl text-center w-fit h-fit"> Exciting Offer</h1>
      <div className="h-1 w-1/4 ml-auto bg-amber-400 rounded-2xl"></div>
      </div>

      <img src={offer1} className="w-full object-center"alt="" />
      <img src={offer2} className="w-full  object-center" alt="" />

    </div>
    <div className="max-w-5xl text-center mx-auto">
      <h1 className="bg-[#45B6A4] text-2xl text-center p-6">HOMEGROWN INDIAN BRAND</h1>
      <h1 className="bg-neutral-100 text-2xl text-center p-19">Over <span className="font-bold">1 Million</span> Smiles Delivered</h1>

    </div>

    <Footer />
    </div>


    </>
    )
}