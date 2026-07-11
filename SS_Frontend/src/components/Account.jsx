import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "./NavBar";
import Footer from "./Footer";
import AddressPage from "./inPages/AddressPage";
import userImg from "../assets/AccountAssests/user.png";
import {
  Pencil,
  LogOut,
  Plus,
  Trash2,
  MapPin,
  Package,
  X,
} from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;

export default function Account() {
  const { login, setLogin, token, setToken, reload } = useContext(AuthContext);

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [option, setOption] = useState("address");
  const [editProfile, setEditProfile]=useState(false)
  const [profileImage, setProfileImage]= useState(null)
  const [profileName, setProfileName]=useState("")
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pageName, setPageName] = useState("ADD");
  const [editAddressIndex, setEditAddressIndex] = useState(null);
  

  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // 🔹 Fetch account
  useEffect(() => {
    if (login && token && !reload) {
      console.log('address')
          setAddresses(login.address)
          return;
    } 

    const fetchAccount = async () => {
      console.log('fetchaccount ke andr')
      try {
        const res = await axios.get(`${apiUrl}/account/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setLogin(res.data.userData);
        setToken(res.data.access_Token);
        setAddresses(res.data.userData.address || []);
      } catch {
        toast.error("Login required");
        setLogin(null);
        setToken(null);
        navigate("/login");
      }
    };
    fetchAccount();
  }, []);

  // 🔹 Fetch orders
  const fetchOrder = async () => {
    try {
      
      const res = await axios.get(`${apiUrl}/orderdetails/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setOrders(res?.data?.userOrderData || []);
      setLogin(res.data.userData)
     setToken(res.data.access_Token);
    } catch(err) {
      
      setLogin(null)
     setToken(null);
      toast.error(err.response.data.userorderData);
      navigate('/login')
    }
  };

  // 🔹 Save / Delete address
  const uploadSetAddress = async (updated) => {
    try {
      const res = await axios.patch(
        `${apiUrl}/account/`,
        { address: updated },
        { headers:{
          Authorization:`Bearer ${token}`
        },
          withCredentials: true }
      );
      setLogin(res.data.userData)
     setToken(res.data.access_Token);
      setAddresses(res.data.userData.address);
      toast.success("Address updated");
    } catch {
       setLogin(null);
        setToken(null);
        toast.error("Address update failed");
        navigate("/login");
     
    }
  };
  const handleProfileSave = async () => { 
    if(!profileName.trim() && profileImage==undefined) {
      toast.error('Name or profile image')
      return }
    const formData = new FormData();
    if(profileImage!=undefined) formData.append("profile_image", profileImage);
    if(profileName!="")formData.append("name", profileName)

     try { 
      const res = await axios.patch( `${apiUrl}/account/`, 
        formData,
         { withCredentials: true, headers: { 
           Authorization:`Bearer ${token}`,
          "Content-Type": "multipart/form-data" },
         } 
        ); 
        setLogin(res.data.userData); 
        setToken(res.data.access_Token)
        toast("Profile name or image updated");
        setEditProfile(false)
       } 
       catch{ 
         setLogin(null)
        setToken(null);
        toast.error("Updating Image or Profile  failed please try to logout and login again"); 
        setEditProfile(false)
        navigate('/login')
      } 
    };
const logout =async()=>{
  
  await axios.get(`${apiUrl}/logout/`,{ 
    headers:{
      Authorization:`Bearer ${token}`
    },
    withCredentials: true })
  .then(()=>{
    toast.success("Successfully Logout")
    setToken(null)
    setLogin(null)
    navigate("/login")})
  .catch(()=>{
    toast.error('something went wrong')

  })
}
  return (
    <>
    {login?
      <>
      <NavBar />
      <div className="bg-[#FAF6EF] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* USER INFO */}
        <div className="bg-white rounded-2xl border border-[#EDE3D3] p-6 sm:p-8 mb-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={login?.profile_image_url || userImg}
            alt="User"
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-[#F0E4C8] shrink-0"
          />

          <div className="w-full text-center md:text-left">
            <h3
              className="text-xl md:text-2xl text-[#2B2422] capitalize"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              {login?.name || "Not provided"}
            </h3>
            <p className="text-sm text-[#8A7F73] mt-1">{login?.email || "Not provided"}</p>

            <div className="flex gap-2.5 justify-center md:justify-start mt-4">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#4A0E1C] border border-[#EDE3D3] hover:bg-[#FBF3E0] transition-colors"
                onClick={() => setEditProfile(true)}
              >
                <Pencil size={14} />
                Edit profile
              </button>

              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#B24444] border border-[#EDE3D3] hover:bg-[#FCEBEB] transition-colors"
                onClick={logout}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>

          {editProfile && (
            <div className="fixed inset-0 bg-[#2B2422]/60 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
                <button
                  onClick={() => setEditProfile(false)}
                  className="absolute top-4 right-4 text-[#B0A48F] hover:text-[#2B2422]"
                >
                  <X size={18} />
                </button>
                <h2
                  className="text-lg text-[#2B2422] mb-5"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
                >
                  Edit profile
                </h2>

                <div className="flex flex-col gap-3 mb-5">
                  <input
                    name="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE3D3] text-sm focus:outline-none focus:border-[#B8862E]"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files[0])}
                    className="w-full text-sm text-[#8A7F73] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[#FBF3E0] file:text-[#8A6A15] file:text-xs file:font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setEditProfile(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[#8A7F73] border border-[#EDE3D3]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileSave}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#4A0E1C] text-[#FFFDF9]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-5">
          <button
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              option === "address"
                ? "bg-[#4A0E1C] text-[#FFFDF9]"
                : "bg-white text-[#8A7F73] border border-[#EDE3D3] hover:bg-[#FBF3E0]"
            }`}
            onClick={() => setOption("address")}
          >
            <MapPin size={14} />
            Addresses
          </button>

          <button
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              option === "orders"
                ? "bg-[#4A0E1C] text-[#FFFDF9]"
                : "bg-white text-[#8A7F73] border border-[#EDE3D3] hover:bg-[#FBF3E0]"
            }`}
            onClick={() => {
              setOption("orders");
              fetchOrder();
            }}
          >
            <Package size={14} />
            Orders
          </button>

          {option === "address" && (
            <button
              onClick={() => {
                setEditAddressIndex(null);
                setPageName("ADD");
                setIsEditOpen(true);
              }}
              className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#3F7D58] border border-[#D7E8DA] bg-[#EAF3DE] hover:bg-[#DCEAC6] transition-colors"
            >
              <Plus size={14} />
              Add address
            </button>
          )}
        </div>

        {/* ADDRESS LIST */}
        {option === "address" && (
          <div className="bg-white rounded-2xl border border-[#EDE3D3] p-5 sm:p-6 space-y-3">
            {addresses.length ? (
              addresses.map((item, index) => (
                <div
                  key={index}
                  className="border border-[#EDE3D3] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center"
                >
                  <p className="wrap-break-word sm:w-2/3 text-sm text-[#2B2422] leading-relaxed">
                    {item.address}, {item.city}, {item.state} - {item.pincode}
                  </p>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditAddressIndex(index);
                        setPageName("EDIT");
                        setIsEditOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8A6A15] bg-[#FBF3E0] hover:bg-[#F5E9C8] transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        const updated = addresses.filter((_, i) => i !== index);
                        uploadSetAddress(updated);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#B24444] bg-[#FCEBEB] hover:bg-[#F7C1C1] transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#B0A48F] text-sm text-center py-10">No address found</p>
            )}
          </div>
        )}

        {/* ORDERS */}
        {option === "orders" && (
          <div className="bg-white rounded-2xl border border-[#EDE3D3] p-5 sm:p-6 space-y-4">
            {orders.length ? (
              orders.map((order, i) => (
                <div key={i} className="border border-[#EDE3D3] rounded-xl p-4">
                  <p className="text-xs text-[#B0A48F] mb-3">
                    {new Date(order.order_date).toLocaleString()}
                  </p>

                  {order.productID.product_ids.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-4 border border-[#F3EDE0] p-3 rounded-lg mb-2 items-start sm:items-center"
                    >
                      <img
                        src={item.product_id.image}
                        className="w-full sm:w-20 h-40 sm:h-24 object-cover rounded-lg border border-[#EDE3D3]"
                      />

                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-[#2B2422]">
                          {item.product_id.product_name}
                        </h3>
                        <p className="text-xs text-[#8A7F73] mt-1">
                          Size {item.product_id.size} · Qty {item.qty}
                        </p>
                        <p className="text-xs text-[#9C9082] mt-0.5">₹{item.price} / piece</p>
                      </div>

                      <div className="font-semibold text-sm text-[#4A0E1C] sm:text-right">
                        ₹{item.qty * item.price}
                      </div>
                    </div>
                  ))}

                  <p className="text-right text-sm font-semibold text-[#3F7D58] mt-2">
                    Total ₹{order.Total_price}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[#B0A48F] text-sm text-center py-10">No orders found</p>
            )}
          </div>
        )}

      </div>
      <Footer />
      </div>
      </>
      :
      <div className="bg-[#FAF6EF] min-h-screen flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h3 className="text-[#8A7F73] text-sm">Fetching account detail…</h3>
      </div>
    
    }


      {isEditOpen && (
        <AddressPage
          pageName={pageName}
          index={editAddressIndex}
          address={addresses}
          setAddress={setAddresses}
          closeModal={() => setIsEditOpen(false)}
          uploadSetAddress={uploadSetAddress}
        />
      )}
    </>
  );
}
