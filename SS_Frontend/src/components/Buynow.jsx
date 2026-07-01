import { useContext, useMemo, useState } from "react"
import { AuthContext } from "../Context/AuthContext"
import NavBar from "./NavBar"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import edit from "../assets/Buynow/edit.png"
import axios from "axios"
import { Link } from "react-router-dom";
import { useEffect } from "react";
import AddressPage from "./inPages/AddressPage"
const apiUrl = import.meta.env.VITE_API_URL;
const Buynow=()=>{
    const {login, setLogin, token , setToken }=useContext(AuthContext)
    const [editProfile,setEditProfile]=useState(false)
    const [profileName, setProfileName]=useState("")
    const [selectedAddress, setSelectedAddress]=useState(0)
    const [selectionPage, setSelectionPage]=useState(false)
    const [isEditOpen, setIsEditOpen]=useState(false) 
    const location =useLocation()
    const product = location.state?.product
    const variant =location.state?.variant
    const selectedSize=location.state?.selectedSize
    const price = product?.variants?.[variant]?.sizes?.[selectedSize].price
    const navigate=useNavigate()

    console.log(location.state)
    console.log(login)
    

useEffect(() => {
  if (!login && !token) {
    toast.warning("login is required to book order");
    navigate("/login");
  }
}, [login, token]);

      const handleProfileSave = async () => { 
        if(!profileName.trim()) {
          toast.error('Name is required to save')
          return }
        const formData = new FormData();
       
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
     
      toast.success("Address updated");
    } catch {
       setLogin(null);
        setToken(null);
        toast.error("Address update failed");
        navigate("/login");
     
    }
  };

    const discount=useMemo(()=>{
        return 0.1*price;

    },[price])



    
    return(
        <>
        <NavBar /> 

        {/* product Detail */}
        <div className="max-w-5xl w-full mx-auto flex p-1 justify-between">
            <div className="p-1 flex flex-col justify-center">
                <div className="md:text-2xl text-xl text-black text-wrap w-fit h-fit">
                    <h1 className="h-fit w-fit "> {product?.product_name}</h1>
                </div>

                <div className="md:text-xl  text-lg text-gray-400 ml-4">
                    Size : {product?.variants?.[variant]?.sizes?.[selectedSize]?.size} | Color : {product?.variants?.[variant]?.color}
                </div>
                
            </div>
            <div className="w-fit h-fit">

                <img src={product?.variants?.[variant]?.image} className="max-w-72 max-h-56 rounded-lg" alt="" />
            </div>


        </div>

        {/* user detail */}

        <div className=" max-w-5xl w-full mx-auto flex flex-col gap-1 p-1 justify-around">
             {editProfile && 
             <div className="fixed inset-0 bg-[#1f1f1fc9] bg-opacity-50 flex items-center justify-center z-100">
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

              {isEditOpen && (
                <AddressPage
                  pageName={"Edit Address"}
                  index={selectedAddress}
                  address={login?.address}
                  closeModal={() => setIsEditOpen(false)}
                  uploadSetAddress={uploadSetAddress}
                />
              )}

              {selectionPage && (
  <div className="fixed inset-0 bg-[#4f4d4d] bg-opacity-50 flex items-center justify-center z-100">
    <div className="bg-gray-300 p-6 rounded-lg w-xl border-2 border-green-700 h-fit m-2">
      
      <h1 className="text-black text-2xl font-semibold my-4">Select Address</h1>

      <div className="flex flex-col gap-2.5">

        {login?.address?.map((item, key) => (
          <div
            key={key}
            onClick={() => setSelectedAddress(key)}
            className={`text-lg text-black border-2 rounded-lg p-3 bg-white cursor-pointer
              ${selectedAddress === key ? "border-green-500 bg-green-50" : "border-gray-300"}
            `}
          >
            <p>{item.address}</p>
            <p>{item.city}, {item.state} - {item.pincode}</p>

            {selectedAddress === key && (
              <div className="text-green-600 font-semibold text-sm mt-1">
                ✓ Selected
              </div>
            )}
          </div>
        ))}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          

          <button
            onClick={() => setSelectionPage(false)}
            className="bg-green-600 px-3 py-1 text-lg rounded-lg text-white"
          >
            Select
          </button>
        </div>

      </div>
    </div>
  </div>
)}

            <h2 className="text-black text-xl font-bold"> Address </h2>
            <div className="ml-5 h-0.5 bg-neutral-700 rounded-2xl"></div>


            <div className="text-black text-xl flex justify-between my-1">
                <h2>Name : </h2>
                <h2 className="font-semibold"> { login?.name}
                    <img src={edit} className="inline-block h-5 w-5 ml-3 cursor-pointer"alt="edit" onClick={()=>setEditProfile(true)}/>
                </h2>
                 </div>
              <div className="text-black text-xl flex justify-between ">
                <h2> Delivering Address : </h2>
                <div className="md:w-2/5 w-3/5 text-end">
  {login?.address?.[selectedAddress] ? (
    <>
      {login.address?.[selectedAddress]?.address}, {login.address?.[selectedAddress]?.city}, {login.address?.[selectedAddress]?.state}, {login.address?.[selectedAddress]?.pincode}
    <div className=" text-blue-600 text-lg inline-block">
        <div className="flex gap-5">
      <img
        src={edit}
        className=" h-5 w-5 ml-3 cursor-pointer"
        alt="edit"
        onClick={() => setIsEditOpen(true)}
      />

      <p  className="cursor-pointer" onClick={()=>setSelectionPage(true)}> Change </p>
      </div>
      
      </div>
    </>
  ) : (
    <div className="flex justify-end">
    <Link
      to="/account"
      className="p-1 text-white bg-blue-600 rounded-md inline-block"
    >
      Add Address
    </Link>
      </div>
  )}
</div>


                 </div>
        </div>

        {/* pricing Detail */}

        <div className="max-w-5xl w-full mx-auto flex-col p-1 gap-1">
            <div className="text-xl font-bold">Pricing</div>
            <div className="ml-5 h-0.5 bg-neutral-700 rounded-2xl"></div>
            <div className=""></div>
            <div className="text-black flex text-lg justify-between">
                <h2>{product?.product_name}</h2>
                <h2>₹{product?.variants?.[variant]?.sizes[selectedSize]?.price}</h2>
            </div>
             <div className="text-black flex text-lg justify-between">
                <h2>Discount 10%</h2>
                <h2>- ₹{discount}</h2>
            </div>

            <div className="flex justify-between text-white md:text-xl text-lg bg-orange-600 p-0.5"  > 

                <h2 > Total Price</h2>
            <h1 className="text-lg font-bold text-white md:text-2xl">₹{product?.variants?.[variant]?.sizes[selectedSize]?.price-discount}</h1>
            </div>
            <div className="flex justify-end">
                <button className="bg-green-500 text-white border-white border-2 rounded-md px-2 py-1 md:text-xl text-lg hover:bg-white hover:text-green-400 hover:border-green-400  ml-auto mt-5  right-0" >
            Proceed To Pay ₹{product?.variants?.[variant]?.sizes[selectedSize]?.price-discount}
        </button>
            </div>
             
        </div>


        {/* proceed to pay button  */}
       


        

        </>
    )

}

export default Buynow