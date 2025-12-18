import NavBar from "./NavBar"
import Footer from "./Footer"
import { useContext, useState } from "react"
import { AuthContext } from "../Context/AuthContext"

export default function UserLogin(){
    const {login, setLogin}=useContext(AuthContext)
    const[loginOpen, setLoginOpen]=useState(false)
    const [mobile, setMobile]=useState()
   
    return(
<>

  

  {/* PAGE CONTENT */}
  <div className="max-w-5xl w-full mx-auto p-3 flex-grow">
      <h2 className="font-bold p-2">Login Required</h2>

      <div className="w-full min-h-[50vh] rounded-2xl border-2 border-gray-400 border-dashed p-3 
                      flex flex-col items-center justify-center">
          <button type="submit" className="bg-amber-400 p-2 rounded-2xl cursor-pointer border-4 border-amber-500" onClick={()=>setLoginOpen((prev)=>!prev)}>
              Login Required
          </button>

          <h3 className="text-2xl text-black text-center">
              Login with us to continue viewing cart, orders etc
          </h3>

          <p>!!!</p>
      </div>

      <div className={`fixed top-0 ${loginOpen?'block':'hidden'} inset-0 bg-black/70 backdrop-blur-sm h-full w-full z-10 p-5 flex flex-col justify-center `} onClick={()=>setLogin(false)}>
        <div className="max-w-2xl w-full py-5 px-3 border-2 border-white rounded-2xl mx-auto bg-[#7373737d]" onClick={(e)=>e.stopPropagation()}>

            <h2 className="text-white text-xl mb-1"> LoginIn/SignIn</h2>
            <div className="bg-neutral-300 h-0.5 w-full"></div>
            <p className="text-white mt-10 mb-1 text-2xl"> Enter the 10 digit Mobile Number :</p>
            <input type="tel" maxlength="10" minlength="10" pattern="[0-9]{10}" value={mobile}  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
             placeholder="Enter 10 digit mobile number" className="block w-1/2 my-2 
         text-emerald-300 placeholder-gray-400
         bg-transparent 
         border-b-2
         border-b-white
         focus:outline-none focus:border-b-emerald-300 focus:ring-0" required  />
             
  <button class="ml-auto block bg-emerald-300 text-white p-2 rounded-2xl" onClick={()=>setLogin(true)}>
    SEND OTP!
  </button>

        </div>
      </div>
  </div>

  {/* FOOTER ALWAYS AT BOTTOM */}
  </>

    )
}