import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";





export default function ProductDetail() {
  

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [sizes,setSizes]=useState(null)
  const {login ,setlogin,token , setToken}= useContext(AuthContext)

  const addToCart=async(id)=>{
    if( !login && !token){
      toast.warning('Before adding to the Cart Please login')
      return
    }
  console.log(token)
    try {
        const res = await axios.post(
          `http://localhost:8000/cart/`,
          { 'product_id': id },
          {
            headers:{
              Authorization:`Bearer ${token}` 
            },
            withCredentials:true
          }
        );
        const data = res.response?.data;
        console.log(data)
        toast.success("Saved to Cart ")
        setlogin(res.response.data.userData)
        setToken(res.response.data.access_Token)
        
        
      } catch (err) {
        const data = err.response?.data;
        toast.warning(data?.error)
        
        setlogin(null)
        setToken(null)
        
        
      } finally {
        setLoading(false);
      }




  }

  // 🔹 Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/productDetail/${variantId}/`
        );
        const data = res.response.data;
        console.log(data)
        setProduct(data?.productData);
        setSelectedSize(data?.productData?.variants?.[selectedColor]?.sizes?.[0] || null);
      } catch (err) {
        const data = err.response.data;
        setProduct(data?.productData);
        setSizes(data?.productData?.variants?.[selectedColor]?.sizes || null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [variantId]);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  const currentImages =
    product?.variants?.[selectedColor]?.image;

  return (
    <div className="flex-col flex ">
      <NavBar />
    <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6 grow">

      {/* 🖼 IMAGE SECTION */}
      <div>
        <div className="bg-gray-100 rounded-lg flex items-center justify-center">
          <img
            src={currentImages}
            className="h-[50vh] w-full object-contain rounded-lg"
            alt=""
          />
        </div>

        <div className="flex gap-2 mt-3">
          {product?.variants?.map((variant, i) => (
            <img
              key={i}
              src={variant?.image}
              onClick={() => {setSelectedImage(i)
                setSelectedColor(i)
                  setSizes(variant.sizes)
              }}
              className={`h-16 w-16 cursor-pointer object-contain border rounded
                ${selectedImage === i ? "border-black" : "border-gray-300"}`}
              alt=""
            />
          ))}
        </div>
      </div>

      {/* 📦 PRODUCT INFO */}
      <div className="flex flex-col">

        <h1 className="text-3xl font-bold capitalize">
          {product.product_name}
        </h1>

        <p className="text-gray-500 mt-1">
          {product.brand}
        </p>

        <p className="text-2xl font-semibold text-green-600 mt-2">
         
          ₹{sizes[selectedSize]?.price}
        </p>

        {/* 🎨 COLORS */}
        <div className="mt-4">
          <p className="font-medium mb-1">Color</p>
          <div className="flex gap-2">
            {product.variants.map((variant, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedColor(i);
                  setSelectedImage(i);
                  setSizes(variant.sizes)
                }}
                className={`px-3 py-1 border rounded
                  ${selectedColor === i
                    ? "border-black"
                    : "border-gray-300"}`}
              >
                {variant?.color}
              </button>
            ))}
          </div>
        </div>

        {/* 📏 SIZES */}
        <div className="mt-4">
          <p className="font-medium mb-1">Size</p>
          <div className="flex gap-2">
            {sizes.map((size,i) => (
              <button
                key={i}
                onClick={() => setSelectedSize(i)}
                className={`px-3 py-1 border rounded
                  ${selectedSize === i
                    ? "bg-black text-white"
                    : "border-gray-300"}`}
              >
                {size.size}
              </button>
            ))}
          </div>
        </div>

        {/* 📝 DESCRIPTION */}
        <p className="mt-6 text-gray-700 first-letter:uppercase">
          {product.description}
        </p>

        {/* 🛒 ACTIONS */}
        <div className="flex gap-4 mt-auto pt-6">
          <button className="bg-yellow-400 px-4 py-2 rounded" onClick={()=>addToCart(sizes[selectedSize]?.size_id)}>
            Add to Cart 
          </button>

          <button
            onClick={() =>
              navigate("/buynow",{state:{product,'variant':selectedImage, selectedSize} })
            }
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
       <Footer />
    </div>
  );
}
