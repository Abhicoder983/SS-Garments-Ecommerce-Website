import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "./NavBar";
import Footer from "./Footer";

axios.defaults.withCredentials = true;

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { login, setLogin, token, setToken} = useContext(AuthContext);
  const navigate=useNavigate()

  /* 🔹 Fetch cart from backend (cookie based) */
  useEffect(() => {
    if(!login || !token) {
        setLogin(null)
        setToken(null)
        }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:8000/cart/",
        {
          headers:{
            Authorization:`Bearer ${token}`
        },
            withCredentials:true
        }
      );
      setCartItems(res.data.cart_Detail || []);
     setLogin(res.data.userData);
    setToken(res.data.access_Token);
    } catch (err) { 
        setToken(null)
        setLogin(null)
        setCartItems(null)
        navigate("/login")
      toast.error(err.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 Update quantity */
  const updateQty = async (product_id ,qty) => {
    if (qty < 1) return;

    await axios.patch (
      "http://localhost:8000/cart/",
      { product_id, qty },
      {headers:{
        Authorization:`Bearer ${token}`
      },
         withCredentials: true }
    ).then((res)=>{
       setLogin(res.data.userData); 
        setToken(res.data.access_Token)
    }).catch((err)=>{
        setLogin(null)
        setToken(null)
        toast.err(err?.response?.data?.error)
        navigate('/login')
      
    })

    fetchCart();
  };

  /* 🔹 Remove item */
  const removeItem = async (product_id) => {
    await axios.delete(
      "http://localhost:8000/cart/",
      
      { data: { product_id },
        headers:{
        Authorization:`Bearer ${token}`
      },
        withCredentials: true }
    ).then((res)=>{
      setLogin(res.data.userData); 
        setToken(res.data.access_Token)
    }).catch((err)=>{
        setLogin(null)
        setToken(null)
        toast.err(err?.response?.data?.error)
        navigate('/login')
    })

    fetchCart();
  };

  /* 🔹 Calculations */
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      ),
    [cartItems]
  );

  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="p-6">Loading cart...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen h-full">
      <NavBar />
    <div className=" bg-gray-100 min-h-[81vh] ">
      <div className="p-6 w-full max-w-5xl mx-auto ">
      <h1 className=" text-2xl font-semibold mb-6">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">
          Your cart is empty 🛒
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            {cartItems.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 border-b pb-4 mb-4"
              >
                <img
                  src={item.image}
                  alt=""
                  className="w-28 h-32 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="font-medium text-lg">
                    {item.product_name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Size: {item.size}
                  </p>

                    <span className="font-semibold text-emerald-600">
                      {`${item.price} * ${item.qty} = ₹${item.price * item.qty}`}
                    </span>
                  <div className="flex items-center justify-between mt-3">

                    <div className=" flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQty(item.product_id, item.qty - 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          updateQty(item.product_id, item.qty + 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                    </div>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-red-500 text-sm flex-wrap"
                >
                  Remove
                </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white rounded-lg shadow p-4 h-fit">
            <h2 className="text-lg font-semibold mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg"
              onClick={() => alert("Checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
     <Footer className='max-w-screen'/>
    </div>
  );
}
