// OrderProcessing.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export default function OrderProcessing() {
  const location = useLocation();
  const { razorpayOrderId } = location.state || {};
  const { setLogin, token, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [status, setStatus] = useState("checking");
  const [orderId, setOrderId] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // ---------------- Poll order status ----------------
  useEffect(() => {
    if (!razorpayOrderId) {
      setStatus("failed");
      return;
    }

    let interval;

    const checkOrderStatus = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/verify-order/${razorpayOrderId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            xsrfCookieName: "csrftoken",
            xsrfHeaderName: "X-CSRFToken",
            withXSRFToken: true,
          }
        );

        console.log("Order status:", res.data);

        if (res.data.status === "success") {
          setStatus("success");
          setOrderId(res.data.order_id);
          console.log("Order ID:", res.data.order_id);
          clearInterval(interval);
        } else if (res.data.status === "failed") {
          setStatus("failed");
          clearInterval(interval);
        }

        // pending hai to kuch nahi karna
      } catch (err) {
        setStatus("failed");
        clearInterval(interval);
        setLogin(null);
        setToken(null);
        navigate("/login");
        toast.error("Error checking order:", err);
      }

      setAttempts((a) => a + 1);
    };

    // Immediately check once
    checkOrderStatus();

    // Then check every 2.5 seconds
    interval = setInterval(checkOrderStatus, 2500);

    // 60 seconds ke baad
    const timeout = setTimeout(() => {
      clearInterval(interval);

      // Agar abhi bhi checking/pending hai
      setStatus((currentStatus) => {
        if (currentStatus === "checking") {
          return "delayed";
        }
        return currentStatus;
      });
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [razorpayOrderId]);

  // ---------------- Intercept back button once resolved ----------------
  useEffect(() => {
    if (status !== "success" && status !== "failed" && status !== "delayed") return;

    // push a dummy history entry so pressing back fires popstate
    // on this same page instead of leaving it immediately
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [status, navigate]);

  // ---------------- SUCCESS ----------------
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-green-600 text-6xl mb-4">✓</div>

        <h1 className="text-3xl font-bold text-green-600">
          Order Successful!
        </h1>

        <p className="mt-3">Your payment has been successfully processed.</p>

        <p className="mt-2">
          Order ID: <strong>{orderId}</strong>
        </p>
      </div>
    );
  }

  // ---------------- FAILED ----------------
  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-6xl mb-4">✕</div>

        <h1 className="text-3xl font-bold text-red-600">Order Failed</h1>

        <p className="mt-3">
          Unfortunately, your payment/order could not be completed.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-5 py-2 bg-blue-600 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ---------------- DELAYED ----------------
  if (status === "delayed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Payment Verification Delayed</h1>

        <p className="mt-3 text-gray-600">
          We are still unable to confirm your payment.
        </p>

        <p className="mt-2">
          Please check your email/SMS for the latest order status.
        </p>
      </div>
    );
  }

  // ---------------- CHECKING / PENDING ----------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-5"></div>

      <p className="text-xl font-semibold">Confirming your payment...</p>

      <p className="text-gray-500 mt-2">Please don't close this page.</p>

      <p className="text-sm text-gray-400 mt-3">
        Checking attempt: {attempts}
      </p>
    </div>
  );
}