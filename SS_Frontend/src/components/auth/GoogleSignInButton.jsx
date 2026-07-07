
import { useState ,useContext, useEffect} from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext.jsx";
import { AuthContext } from "../../Context/AuthContext.jsx"
const API_BASE_URL = import.meta.env.VITE_API_Local_BASE_URL;
import {toast } from "react-toastify";

export default function GoogleSignInDropdown () {
  const {  setLogin, token, setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showGoogleLogin,setShowGoogleLogin]=useState(()=>sessionStorage.getItem('showgooglelogin')=="false"?false:true)
  const [isClose , setIsClose]=useState(false)

  const handleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      console.log(idToken)
      // ${API_BASE_URL}/google-login/
      const res = await axios.post("http://localhost:8000/google-login/", {
        id_token: idToken,
      },{ withCredentials: true } );
      
      setLogin(res.data.user);
      setToken(res.data.accessToken);
      toast.success(res.data?.message)

      navigate("/account");
    } catch (err) {
      setError(`Google sign-in failed. Please try again.${err}`);
    }
  };
  useEffect(()=>{
    if(token){
      setIsClose(true);
      setTimeout(() => {
        sessionStorage.setItem("showgooglelogin", false);
        setShowGoogleLogin(false)
      }, 300);
    }
  },[token])

  return (
     showGoogleLogin && (
        
      <div className={`fixed top-[60px] right-[20px] bg-[#1a1a1a] border border-[#333] rounded-[12px] p-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-[1000] w-[300px] transition-all duration-300 ease-in-out
${isClose ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>
      <button
        onClick={()=>{
          setIsClose(true)
          setTimeout(() => {
            
            sessionStorage.setItem("showgooglelogin", false);
            setShowGoogleLogin(false)
          }, 300);
          }
        }
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "transparent",
          border: "none",
          color: "#aaa",
          fontSize: "18px",
          cursor: "pointer",
          lineHeight: 1,
        }}
        aria-label="Close"
      >
        ×
      </button>

      <p style={{ color: "#fff", marginBottom: "16px", marginTop: "8px", fontSize: "14px" }}>
        Sign in to continue
      </p>

      {error && <p style={{ color: "#ff6b6b", fontSize: "13px" }}>{error}</p>}

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError("Google sign-in was cancelled or failed.")}
        theme="filled_black"
        size="large"
        shape="pill"
        text="continue_with"
        width="260"
      />
    </div>
    
      )
    
     
    
  );
}

