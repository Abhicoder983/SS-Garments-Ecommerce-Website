import NavBar from "./NavBar"
import Footer from "./Footer"
import { useContext, useState, useEffect } from "react"
import { AuthContext } from "../Context/AuthContext"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import FullPageLoader from "./loadingPage/FullPageLoader"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const apiUrl = import.meta.env.VITE_API_URL

const csrfConfig = {
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withXSRFToken: true,
}

export default function UserLogin() {
  const { login, token, setLogin, setToken } = useContext(AuthContext)

  const [loginOpen, setLoginOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpEnable, setotpEnable] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setotp] = useState("")
  const [timeLeft, setTimeLeft] = useState(120)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const navigate = useNavigate()

  // Page load: existing token/login ho to account fetch karo, Google code ho to login complete karo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (token || login) {
      const fetchAccount = async () => {
        try {
          const response = await axios.get(`${apiUrl}/account/`, {
            headers: { Authorization: `Bearer ${token}` },
            ...csrfConfig,
          })
          setLogin(response.data?.userData)
          setToken(response.data?.access_Token)
          navigate("/account")
        } catch (err) {
          console.log(err?.response?.data?.error)
        }
      }
      fetchAccount()
    } else if (code) {
      const googleAuth = async (code) => {
        setLoading(true)
        try {
          const response = await axios.post(
            `${apiUrl}/google-oauth2-authentication/`,
            { code },
            csrfConfig
          )
          setLogin(response.data?.userData)
          setToken(response.data?.accessToken)
          toast.success(response.data?.message)
          navigate("/account")
        } catch (error) {
          toast.error(error?.response?.data?.error)
        } finally {
          setLoading(false)
        }
      }
      googleAuth(code)
    }
  }, [])

  // OTP countdown timer
  useEffect(() => {
    if (!otpEnable) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [otpEnable])

  // Sab state ek saath reset karne ke liye
  const resetForm = () => {
    setEmail("")
    setotp("")
    setotpEnable(false)
    setTimeLeft(120)
  }

  const closeModal = () => {
    resetForm()
    setLoginOpen(false)
    setToken(null)
  }

  const loginFunction = async () => {
    if (verifying) return
    if (!(email && otp)) {
      return toast.warn("Enter your Email and OTP")
    }

    setVerifying(true)
    try {
      const response = await axios.post(
        `${apiUrl}/signup/`,
        { email, otp },
        csrfConfig
      )
      setLogin(response.data?.userData)
      setToken(response.data?.accessToken)
      toast.success(response.data?.message)
      resetForm()
      navigate("/account")
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.error)
      resetForm()
    } finally {
      setVerifying(false)
    }
  }

  const sendOTP = async () => {
    if (sendingOtp) return
    if (!email.trim()) {
      return toast.warn("Please Enter your Email")
    }

    setSendingOtp(true)
    setotpEnable(false)
    try {
      const response = await axios.post(
        `${apiUrl}/verify/`,
        { email: email.trim() },
        csrfConfig
      )
      setotpEnable(true)
      setTimeLeft(120)
      toast.success(response.data?.message)
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.error)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: "https://ssgarment.in/login",
      response_type: "code",
      scope: "openid email profile",
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0")
  const seconds = String(timeLeft % 60).padStart(2, "0")

  return (
    <>
      {loading && <FullPageLoader message="sigin in ..." />}

      <div className="min-h-screen flex flex-col justify-between bg-[#ffffff]">
        <NavBar />

        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
          <h2 className="font-semibold text-xl sm:text-2xl text-[#c9a24b] mb-5 sm:mb-6 tracking-wide">
            Login Required
          </h2>

          <div
            className="w-full min-h-[45vh] sm:min-h-[50vh] rounded-2xl border-2 border-[#3a3a3a] border-dashed
                       bg-[#ffffff] p-6 sm:p-8
                       flex flex-col items-center justify-center gap-5 text-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#c9a24b]/40 border border-black flex items-center justify-center shrink-0">
              <span className="text-2xl sm:text-3xl">🔒</span>
            </div>

            <button
              type="button"
              className="bg-[#c9a24b] hover:bg-[#edaf27] text-[#1a1a1a] font-semibold
                         px-5 sm:px-6 py-2.5 rounded-full cursor-pointer text-sm sm:text-base
                         transition-all duration-200 active:scale-[0.97]
                         shadow-[0_4px_16px_rgba(201,162,75,0.25)]"
              onClick={() => {
                resetForm()
                setLoginOpen((prev) => !prev)
                setToken(null)
              }}
            >
              Login Required
            </button>

            <h3 className="text-base sm:text-lg text-[#222222] max-w-md px-2">
              Login with us to continue viewing cart, orders etc
            </h3>
          </div>
        </div>

        {/* MODAL OVERLAY */}
        <div
          className={`fixed top-0 ${loginOpen ? "flex" : "hidden"} inset-0
                      bg-white/80 backdrop-blur-sm h-full w-full z-50 p-4 sm:p-5
                      flex-col justify-center items-center overflow-y-auto`}
          onClick={closeModal}
        >
          <div
            className="max-w-md w-full my-auto py-6 px-5 sm:py-8 sm:px-6 rounded-2xl mx-auto
                       bg-white/95 sm:bg-white/60 border border-[#333]
                       shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                       max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-gray-900 text-lg sm:text-xl font-semibold mb-3">
              Login / Sign In
            </h2>
            <div className="bg-[#333] h-px w-full mb-6"></div>

            <p className="text-[#030303] text-base sm:text-lg">
              Enter your Email :
            </p>

            <div className="flex flex-col xs:flex-row w-full justify-end gap-2 items-stretch xs:items-center mt-1">
              <input
                type="email"
                name="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 min-w-0 text-[#000000] placeholder-gray-500
                           bg-transparent border-b-2 border-b-[#444] py-1.5
                           focus:outline-none focus:border-b-[#c9a24b] focus:ring-0
                           transition-colors duration-200"
                required
              />
              <button
                type="button"
                disabled={sendingOtp}
                className={`shrink-0 text-sm font-medium rounded-full px-5 py-1.5
                            border-2 transition-all duration-200
                            ${
                              sendingOtp
                                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                                : "bg-[#c9a24b] border-[#c9a24b] text-[#1a1a1a] hover:bg-transparent hover:text-[#c9a24b] active:scale-[0.97]"
                            }`}
                onClick={sendOTP}
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>
            </div>

            {otpEnable && (
              <div className="mt-4 w-full flex flex-col xs:flex-row xs:items-end gap-2 xs:gap-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setotp(e.target.value)}
                  placeholder="Enter OTP"
                  className="flex-1 min-w-0 text-black placeholder-gray-500
                             bg-transparent border-b-2 border-b-[#444] py-1.5
                             focus:outline-none focus:border-b-[#c9a24b] focus:ring-0
                             transition-colors duration-200"
                  required
                />
                <p className="text-sm font-medium text-red-400 xs:text-center whitespace-nowrap shrink-0">
                  <span className="text-base font-semibold">
                    {minutes}:{seconds}
                  </span>
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={verifying}
              className={`${otpEnable ? "block" : "hidden"} mx-auto mt-4
                          text-sm font-medium px-5 py-2 rounded-full
                          transition-all duration-200
                          ${
                            verifying
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white active:scale-[0.97]"
                          }`}
              onClick={loginFunction}
            >
              {verifying ? "Verifying..." : "Verify"}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#333]"></div>
              <span className="text-xs text-[#888] tracking-wide">OR</span>
              <div className="flex-1 h-px bg-[#333]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group flex items-center justify-center gap-3
                         w-full
                         bg-[#f9f9f9] hover:bg-[#242424]
                         border border-[#3a3a3a] hover:border-[#c9a24b]
                         text-black hover:text-white
                         rounded-full
                         px-4 sm:px-6 py-2.5
                         text-sm font-medium
                         transition-all duration-200 ease-in-out
                         shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                         hover:shadow-[0_4px_16px_rgba(201,162,75,0.15)]
                         active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              <span className="tracking-wide text-sm">Continue with Google</span>
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}