import { useContext, useEffect } from "react";
import { AuthContext } from "../Context/AuthContext";
import Footer from "./Footer";
import NavBar from "./NavBar";
import checkout from "../assets/AccountAssests/checkout.png";
import order from "../assets/AccountAssests/order.png";
import watchlist from "../assets/AccountAssests/watchlist.png";
import UserLogin from "./UserLogin";

export default function Account() {
  const { login } = useContext(AuthContext);
  
  useEffect(()=>{
    
  },[])

  return (
    <>
      {/* FULL PAGE FLEX CONTAINER */}
      <div className="h-screen flex flex-col justify-between ">

        <NavBar />

        {/* MAIN CONTENT → will take available space */}
        <div className="min-h-fit h-56 flex  p-1">
          {login ? (
            <div className="max-w-5xl w-full h-full p-1 mx-auto border-2 border-black rounded-xl">
              <div className="mb-4">
                Account | {login && login.name}
              </div>

              <div className="w-full h-1/2 flex flex-wrap justify-around items-center gap-4">
                <div className="text-center w-fit h-fit">
                  <img src={order} className="w-14 h-10 mx-auto" alt="Orders"/>
                  <p className="text-lg mt-1 font-semi-bold">Orders</p>
                </div>

                <div className="text-center w-fit h-fit">
                  <img src={watchlist} className="w-14 h-10 mx-auto" alt="Watchlist" />
                  <p className="text-lg mt-1 font-semi-bold">Watchlist</p>
                </div>

                <div className="text-center w-fit h-fit">
                  <img src={checkout} className="w-14 h-10 mx-auto" alt="Checkout" />
                  <p className="text-lg mt-1 font-semi-bold">Checkout</p>
                </div>
              </div>
            </div>
          ) : (
            <UserLogin />
          )}
        </div>

        {/* FOOTER ALWAYS AT BOTTOM */}
        <Footer />
      </div>
    </>
  );
}

