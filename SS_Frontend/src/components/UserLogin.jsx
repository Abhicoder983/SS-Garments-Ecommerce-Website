import NavBar from "./NavBar"
import Footer from "./Footer"
import { useContext, useState,useEffect } from "react"
import { AuthContext } from "../Context/AuthContext"
import axios from "axios"
import {toast } from "react-toastify";
import {  useNavigate } from "react-router-dom"

export default function UserLogin(){
    const { login,token,setLogin, setToken}=useContext(AuthContext)
    const[loginOpen, setLoginOpen]=useState(false)
    const[otpEnable, setotpEnable]= useState(false)
    const [mobile, setMobile]=useState(null)
    const[otp, setotp]=useState(null)
    const [timeLeft, setTimeLeft] = useState(120);
    const navigate= useNavigate()
    useEffect(()=>
      {
         if(!token || !login){
      const fetchAccount=async()=>{
  await axios.get(
  'http://localhost:8000/account/',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }
).then((response)=>{
      
      setLogin(response.data?.userData)
      
      setToken(response.data?.access_Token)
      console.log(token)
      console.log(login)
      navigate('/account')

    })
    .catch((err)=>{
      console.log(err)
      console.log('abhishek')
      console.log(err?.response?.data?.error)
      
    })
    

}
fetchAccount()
    }
      },[])
   
    useEffect(() => {
   
    if (!otpEnable) return;
     
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
       
        return prev - 1;
      });
    }, 1000);
    return ()=>{
      console.log('clear interval')
      clearInterval(timer)
      
    }
    
  },[otpEnable])

    const loginFunction = async() => {
      if(!(mobile && otp)){
        return toast.warn('Enter Mobile number and OTP')
      }
     await axios.post('http://localhost:8000/signup/',

      {mobile,otp},{ withCredentials: true })
      .then((response)=>{
        setLogin(response.data?.userData)
        toast.success(response.data?.message)
        console.log(response.data?.accessToken)
        setToken(response.data?.accessToken)
        setMobile(null)
        setotpEnable(false)
        setTimeLeft(120)
        setotp(null)
        navigate('/account')
      })
      .catch((error)=>{
        console.log(error)
        toast.error(error?.response?.data?.error)
        setMobile(null)
        setotpEnable(false)
        setTimeLeft(120)
        setotp(null)
      
      })

     }
      
    
    const verify =async()=>{
      if(!mobile){
        return toast.warn('Please Enter number')
      }
      setotpEnable(false)
      await axios.post('http://localhost:8000/verify/',{
        mobile
      }
    , { withCredentials: true })
    .then((data)=>{
      
      setotpEnable(true)
      setTimeLeft(120)
      
      toast.success(data.data?.message)
    })
      .catch((error)=>{
        console.log('abhishek')
        console.log(error)
        toast.error(error?.response?.data?.error)
      })
    }
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

    return(

    <>
    <div className="h-screen flex flex-col justify-between ">
    <NavBar />
  <div className="max-w-5xl w-full mx-auto p-3 flex-grow">
      <h2 className="font-bold p-2">Login Required</h2>

      <div className="w-full min-h-[50vh] rounded-2xl border-2 border-gray-400 border-dashed p-3 
                      flex flex-col items-center justify-center">
          <button type="submit" className="bg-amber-400 p-2 rounded-2xl cursor-pointer border-4 border-amber-500" onClick={()=>{
            setMobile(null)
            setLoginOpen((prev)=>!prev)
            setToken(null)
            setotpEnable(false)
            setotp(null)}}>
              Login Required
          </button>

          <h3 className="text-2xl text-black text-center">
              Login with us to continue viewing cart, orders etc
          </h3>

          <p>!!!</p>
      </div>

      <div className={`fixed top-0 ${loginOpen?'block':'hidden'} inset-0 bg-black/70 backdrop-blur-sm h-full w-full z-10 p-5 flex flex-col justify-center `} onClick={()=>setLoginOpen(false)}>
        <div className="max-w-2xl w-full py-5 px-3 border-2 border-white rounded-2xl mx-auto bg-[#7373737d]" onClick={(e)=>e.stopPropagation()}>

            <h2 className="text-white text-xl mb-1"> LoginIn/SignIn</h2>
            <div className="bg-neutral-300 h-0.5 w-full"></div>
            <p className="text-white mt-10 mb-1 text-2xl"> Enter the 10 digit Mobile Number :</p>
            <div className="flex w-full">
              
            <input type="tel" maxlength="10" minlength="10" pattern="[0-9]{10}" value={mobile}  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
             placeholder="Enter 10 digit mobile number" className="block w-1/2 my-2 text-emerald-300 placeholder-gray-400
         bg-transparent 
         border-b-2
         border-b-white
         focus:outline-none focus:border-b-emerald-300 focus:ring-0" required  />
         <button className=" bg-fuchsia-300 text-center text-white rounded-xl m-1 px-6 hover:bg-transparent hover:border-fuchsia-300 border-2 hover:text-fuchsia-300" onClick={verify}> Verify</button>
            </div>

          {otpEnable?
          <div className=" mt-3 flex">
            <input
  type="text"
  value={otp}
  onChange={(e) => setotp(e.target.value)}
  placeholder="Enter OTP"
  className="block w-1/2 my-2 text-emerald-300 placeholder-gray-400
             bg-transparent 
             border-b-2
             border-b-white
             focus:outline-none focus:border-b-emerald-300 focus:ring-0"
  required
/>
 <p className="text-lg font-semibold text-red-400">
      OTP expires in <br></br> <p className="text-center">{minutes}:{seconds}</p>
    </p>

          </div>:''}

             
  <button className={`${otpEnable?'block':'hidden'} ml-auto block bg-emerald-300 text-white p-2 rounded-2xl`} onClick={loginFunction}>
    SEND OTP!
  </button>

        </div>
      </div>
  </div>

  {/* FOOTER ALWAYS AT BOTTOM */}
   <Footer />
   </div>
  </>

    )
}