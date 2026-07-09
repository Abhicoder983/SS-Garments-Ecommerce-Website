import NavBar from "./NavBar"
import Footer from "./Footer"
import { useContext, useState,useEffect } from "react"
import { AuthContext } from "../Context/AuthContext"
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
import axios from "axios"
import {toast } from "react-toastify";
import {  useNavigate } from "react-router-dom"
const apiUrl = import.meta.env.VITE_API_URL;
import FullPageLoader from "./loadingPage/FullPageLoader"
export default function UserLogin(){
    const { login,token,setLogin, setToken}=useContext(AuthContext)
    const[loginOpen, setLoginOpen]=useState(false)
    const [loading ,setLoading]=useState(false)
    const[otpEnable, setotpEnable]= useState(false)
    const [email, setEmail]=useState(null)
    const[otp, setotp]=useState(null)
    const [timeLeft, setTimeLeft] = useState(120);
    const navigate= useNavigate()
    useEffect(()=>
      {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        console.log('abhishek1234')
        console.log(code)
        console.log(token)
        console.log(login)
         if(token || login){
          console.log('1234')
      const fetchAccount=async()=>{
  await axios.get(
  `${apiUrl}/account/`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }
).then((response)=>{
      console.log(apiUrl)
      setLogin(response.data?.userData)
      setToken(response.data?.access_Token)
      navigate('/account')

    })
    .catch((err)=>{
      console.log(apiUrl)
      console.log(err)
      console.log('abhishek')
      console.log(err?.response?.data?.error)
      
    })
  

  
    

          }
      fetchAccount()

    }
        else if(code) {
    // backend ko bhejo, verify karo, login complete karo
    console.log(code)
    const googleAuth=async(code)=>{
      setLoading(true)
      await axios.post(`${apiUrl}/google-oauth2-authentication/`, { code: code }, { withCredentials: true })
      .then((response) => {
        // login success, ab dashboard pe navigate kar do
        setLogin(response.data?.userData)
        toast.success(response.data?.message)
        console.log(response.data?.accessToken)
        setToken(response.data?.accessToken)
        setLoading(false)
        navigate('/account')
      }).catch((error)=>{
        toast.error(error?.response?.data?.error)
        setLoading(false)
       })
    }
    googleAuth(code)
    
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
      if(!(email && otp)){
        return toast.warn('Enter your Email and OTP')
      }
     await axios.post(`${apiUrl}/signup/`,

      {email,otp},{ withCredentials: true })
      .then((response)=>{
        console.log(response.data)
        setLogin(response.data?.userData)
        setToken(response.data?.accessToken)
        toast.success(response.data?.message)
        console.log(response.data?.accessToken)
        setEmail(null)
        setotpEnable(false)
        setTimeLeft(120)
        setotp(null)
        navigate('/account')
      })
      .catch((error)=>{
        console.log(error)
        toast.error(error?.response?.data?.error)
        setEmail(null)
        setotpEnable(false)
        setTimeLeft(120)
        setotp(null)
      
      })

     }
      
    
    const verify =async()=>{
      if(!email){
        return toast.warn('Please Enter your Email')
      }
      setotpEnable(false)
      await axios.post(`${apiUrl}/verify/`,{
        email
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
    {loading && <FullPageLoader message="sigin in ..."/>}
    <div className="h-screen flex flex-col justify-between bg-[#ffffff]">
  <NavBar />
 
  <div className="max-w-5xl w-full mx-auto p-4 flex-grow">
    <h2 className="font-semibold text-2xl text-[#c9a24b] mb-6 tracking-wide">
      Login Required
    </h2>
 
    <div
      className="w-full min-h-[50vh] rounded-2xl border-2 border-[#3a3a3a] border-dashed
                 bg-[#ffffff] p-8
                 flex flex-col items-center justify-center gap-5 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#c9a24b]/40 border border-black flex items-center justify-center">
        <span className="text-3xl">🔒</span>
      </div>
 
      <button
        type="submit"
        className="bg-[#c9a24b] hover:bg-[#edaf27]  text-[#1a1a1a] font-semibold
                   px-6 py-2.5 rounded-full cursor-pointer
                   transition-all duration-200 active:scale-[0.97]
                   shadow-[0_4px_16px_rgba(201,162,75,0.25)]"
        onClick={() => {
          setEmail(null)
          setLoginOpen((prev) => !prev)
          setToken(null)
          setotpEnable(false)
          setotp(null)
        }}
      >
        Login Required
      </button>
 
      <h3 className="text-lg text-[#222222] max-w-md">
        Login with us to continue viewing cart, orders etc
      </h3>
    </div>
  </div>
 
  {/* MODAL OVERLAY */}
  <div
    className={`fixed top-0 ${loginOpen ? 'flex' : 'hidden'} inset-0
                bg-white/80 backdrop-blur-sm h-full w-full z-50 p-5
                flex-col justify-center items-center`}
    onClick={() => setLoginOpen(false)}
  >
    <div
      className="max-w-md w-full py-8 px-6 rounded-2xl mx-auto
                 bg-white/60 border border-[#333]
                 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-gray-900 text-xl font-semibold mb-3">
        Login / Sign In
      </h2>
      <div className="bg-[#333] h-px w-full mb-6"></div>
 
      <p className="text-[#030303]  text-lg  ">
        Enter your Email :
      </p>
 
      <div className="flex w-full justify-end gap-2 items-center">
        <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email address"
  className="flex-1 text-[#000000] placeholder-gray-500
             bg-transparent border-b-2 border-b-[#444] py-1.5
             focus:outline-none focus:border-b-[#c9a24b] focus:ring-0
             transition-colors duration-200"
  required
/>
        <button
          className="bg-[#c9a24b] hover:bg-transparent text-[#1a1a1a] hover:text-[#c9a24b]
                     border-2 border-[#c9a24b]
                     text-sm font-medium rounded-full px-5 py-1.5
                     transition-all duration-200 active:scale-[0.97]"
          onClick={verify}
        >
          Verify
        </button>
      </div>
 
      {otpEnable ? (
        <div className="mt-4 w-11/12 mr-0 flex items-end gap-3">
          <input
            type="text"
            value={otp}
            onChange={(e) => setotp(e.target.value)}
            placeholder="Enter OTP"
            className="flex-1 text-black placeholder-gray-500
                       bg-transparent border-b-2 border-b-[#444] py-1.5
                       focus:outline-none focus:border-b-[#c9a24b] focus:ring-0
                       transition-colors duration-200"
            required
          />
          <p className="text-sm font-medium text-red-400 text-center whitespace-nowrap">
          
            <br />
            <span className="text-base font-semibold">{minutes}:{seconds}</span>
          </p>
        </div>
      ) : (
        ''
      )}
 
      <button
        className={`${otpEnable ? 'block' : 'hidden'} mx-auto mt-4
                    bg-emerald-500 hover:bg-emerald-600 text-white
                    text-sm font-medium px-5 py-2 rounded-full
                    transition-all duration-200 active:scale-[0.97]`}
        onClick={loginFunction}
      >
        Send OTP
      </button>
 
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#333]"></div>
        <span className="text-xs text-[#888] tracking-wide">OR</span>
        <div className="flex-1 h-px bg-[#333]"></div>
      </div>
 
      <button
        onClick={() => {
          const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: `https://ssgarment.in/login`,  // fixed, same login page
            response_type: "code",
            scope: "openid email profile",
          });
          window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        }}
        type="button"
        className="
          group flex items-center justify-center gap-3
          w-full
          bg-[#f9f9f9] hover:bg-[#242424]
          border border-[#3a3a3a] hover:border-[#c9a24b]
          text-black hover:text-white
          rounded-full
          px-6 py-2.5
          text-sm font-medium
          transition-all duration-200 ease-in-out
          shadow-[0_2px_8px_rgba(0,0,0,0.3)]
          hover:shadow-[0_4px_16px_rgba(201,162,75,0.15)]
          active:scale-[0.98]
        "
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
        <span className="tracking-wide text-sm">
          Continue with Google
        </span>
      </button>
    </div>
  </div>
 
  {/* FOOTER ALWAYS AT BOTTOM */}
  <Footer />
</div>
  </>

    )
}