import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "./NavBar";
import Footer from "./Footer";
import AddressPage from "./inPages/AddressPage";
import userImg from "../assets/AccountAssests/user.png";
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

  // 🔹 Fetch account
  useEffect(() => {
    if (login && token && !reload) {
          setAddresses(login.address)
          return;
    } 

    const fetchAccount = async () => {
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
        toast("Profile image updated");
        setEditProfile(false)
       } 
       catch{ 
         setLogin(null)
        setToken(null);
        toast.error("Image upload failed please try to logout and login again"); 
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
      <div className="max-w-5xl mx-auto p-4">
        {/* USER INFO */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="w-full md:w-2/3 text-center md:text-left">
            <h3 className="text-xl font-semibold my-3  ">
              Name | {login?.name || "Not provided"} <br />
              Mobile | {login?.mobile_no || "Not provided"}
            </h3>
           
          </div>

          <div className="flex flex-col items-center gap-2">
            <img
              src={login?.profile_image_url || userImg}
              alt="User"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
            />
             <div className="flex gap-3 justify-between">
             <button className="p-1 rounded-lg bg-yellow-400 text-white text-md border-2 border-amber-400 hover:border-yellow-400 hover:text-yellow-400 hover:bg-amber-200"
            onClick={()=>setEditProfile(true)}> Edit Profile</button>

             <button className="p-1 rounded-lg text-white text-md border-2 border-red-600 bg-red-600 hover:bg-red-300 hover:text-red-600" onClick={logout}> Logout</button> 
          </div>
           
            {editProfile && 
             <div className="fixed inset-0 bg-neutral-200 bg-opacity-50 flex items-center justify-center z-100">
      <div className="bg-white p-6 rounded-lg w-96 border-2 border-green-700 h-fit m-2">
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        <div className=" h-2/4 gap-2 flex flex-col justify-evenly  m-4">
          <input
          name="name"
          value={profileName}
          onChange={(e)=>{
            setProfileName(e.target.value)
          }}
          placeholder="Your Name"
        
            className={`w-full p-2 rounded border `}
        />

         <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} 
         className={`w-full p-2 rounded border `} />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={()=>setEditProfile(false)}
            className="px-4 py-2 bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleProfileSave}
            className="px-4 py-2 bg-emerald-600 rounded"
          >
            Save
          </button>
        </div>
        </div>
        </div>
        }
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-col sm:flex-row border-b mb-4">
          <div
            className={`flex justify-between items-center p-2 cursor-pointer w-full bg-neutral-100 ${
              option === "address" && "border-b-2 border-gray-700 bg-neutral-500"
            }`}
            onClick={() => setOption("address")}
          >
            <p>Addresses</p>
            {option === "address" && <button
              onClick={() => {
                setEditAddressIndex(null);
                setPageName("ADD");
                setIsEditOpen(true);
              }}
              className="bg-green-600 text-white px-3 rounded"
            >
              ADD
            </button>} 
            
          </div>

          <div
            className={`p-2 text-center cursor-pointer w-full bg-neutral-100 ${
              option === "orders" && "border-b-2 border-gray-700  bg-neutral-500"
            }`}
            onClick={() => {
              setOption("orders");
              fetchOrder();
            }}
          >
            Orders
          </div>
        </div>

        {/* ADDRESS LIST */}
        {option === "address" && (
          <div className="space-y-4 h-[70vh] border-2 border-black rounded-lg p-2 my-2  overflow-y-auto">
            {addresses.length ? (
              addresses.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row gap-3 justify-between"
                >
                  <p className="wrap-break-word sm:w-2/3">
                    {item.address}, {item.city}, {item.state} - {item.pincode}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setEditAddressIndex(index);
                        setPageName("EDIT");
                        setIsEditOpen(true);
                      }}
                      className="bg-yellow-400 px-3 py-1 rounded"
                    >
                      EDIT
                    </button>
                     
                    <button
                      onClick={() => {
                        const updated = addresses.filter((_, i) => i !== index);
                        uploadSetAddress(updated);
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No address found</p>
            )}
          </div>
        )}

        {/* ORDERS */}
        {option === "orders" && (
          <div className="space-y-4 h-[70vh] border-2 border-black rounded-lg p-3 my-2  overflow-y-auto">
            {orders.length ? (
              orders.map((order, i) => (
                <div key={i} className="border p-4 rounded">
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(order.order_date).toLocaleString()}
                  </p>

                  {order.productID.product_ids.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-4 border p-3 rounded mb-2"
                    >
                      <img
                        src={item.product_id.image}
                        className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {item.product_id.product_name}
                        </h3>
                        <p>Size: {item.product_id.size} | Qty: {item.qty}</p>
                        <p>₹{item.price}</p>
                      </div>

                      <div className="font-bold text-right sm:text-center">
                        ₹{item.qty * item.price}
                      </div>
                    </div>
                  ))}

                  <p className="text-right font-semibold text-green-600">
                    Total ₹{order.Total_price}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No orders found</p>
            )}
          </div>
        )}

        <Footer />
        
      </div>
      </>
      :
      <h3 className="pl-4">Fetching Account Detail</h3>
    
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
