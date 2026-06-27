import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "./NavBar";
import axios from "axios";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ---------------- FILTER STATES ----------------
  const [openFilter, setOpenFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [orderBy, setOrderBy]=useState('price_low')
  const [minPrice, setMinPrice]= useState('')
  const [gender ,setGender]=useState(null)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- URL → STATE (Back / Forward) ----------------
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSize(searchParams.get("size") || "");
    setOrderBy(searchParams.get('order') || "")
    setMaxPrice(searchParams.get("max_price") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setGender(searchParams.get('gender') || null)
  }, [searchParams]);

  // ---------------- STATE → URL (Auto Apply Filters) ----------------
  useEffect(() => {
    if (!search) return;

    const params = new URLSearchParams();

    params.set("search", search);
    if (size) params.set("size", size);
    if (maxPrice) params.set("max_price", maxPrice);
    if (minPrice) params.set("min_price", minPrice);
    if (orderBy) params.set('order',orderBy)
    if (gender) params.set('gender',gender)
    

    // 🔑 avoid unnecessary URL update
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [search, size, maxPrice,orderBy,minPrice,gender]);

  // ---------------- URL → BACKEND FETCH ----------------
  useEffect(() => {
    if (!searchParams.get("search")) {
      navigate("/");
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const qs = searchParams.toString();
        const res = await axios.get(
          `http://127.0.0.1:8000/products/?${qs}`
        );
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // ---------------- CLEAR FILTERS ----------------
  const clearFilters = () => {
    setSize("");
    setMaxPrice("");
    setMinPrice("")
    setSearchParams({ search });
    setOrderBy("")
    setGender(null)
    setOpenFilter(false)
  };

  return (
    <>
      <NavBar />

      

        
      

{/* ================= FILTER NAVBAR ================= */}

<div className="sticky top-0 z-10 bg-neutral-200 border-b shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-3 justify-between items-center">

    {/* SORT */}
    <div
      className="relative group"
     
    >
      <button
        onClick={() =>
          setOpenFilter(openFilter === "sort" ? null : "sort")
        }
        className={`px-4 py-1 border rounded ${orderBy?"bg-blue-700 text-white":""}`}
      >
        Sort
      </button>

      {(openFilter === "sort") && (
        <div className="absolute left-0 mt-2 bg-neutral-100 border shadow-lg rounded min-w-[160px] rounded-t-none">
          {['price_low', 'price_high'].map((item) => (
            <div
              key={item}
              onClick={() => {
                setOrderBy(item);
                setOpenFilter(null);
              }}
              className={`cursor-pointer p-1  mb-1 uppercase
              ${orderBy === item ? "bg-blue-700 text-white" : "hover:bg-gray-100"}`}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* GENDER */}
    <div
      className="relative group"
      
    >
      <button
        onClick={() =>
          setOpenFilter(openFilter === "gender" ? null : "gender")
        }
        className={`px-4 py-1 border rounded ${gender?"bg-blue-700 text-white":""}`}
      >
        Gender
      </button>

      {(openFilter === "gender") && (
        <div className="absolute left-0 mt-2 bg-neutral-100 border shadow-lg rounded rounded-t-none min-w-[160px]">
          {['male', 'female'].map((item) => (
            <div
              key={item}
              onClick={() => {
                setGender(item);
                setOpenFilter(null);
              }}
              className={`cursor-pointer p-1 rounded mb-1 uppercase
              ${gender === item ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* SIZE */}
    <div
      className="relative  group"
    
    >
      <button
        onClick={() =>
          setOpenFilter(openFilter === "size" ? null : "size")
        }
        className={`px-4 py-1 border rounded ${size?"bg-blue-700 text-white":""}`}
      >
        Size
      </button>

      {(openFilter === "size") && (
        <div className="absolute left-0 mt-2 bg-neutral-100 border shadow-lg rounded rounded-t-none  p-3 grid grid-cols-4 gap-2 h-32 w-56">
          {["XS","S","M","L","XL","XXL","3XL","4XL"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSize(s);
                setOpenFilter(null);
              }}
              className={`border px-2 py-1 rounded
              ${size === s ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>

    {/* PRICE */}
    <div
      className="relative group"
     
    >
      <button
        onClick={() =>
          setOpenFilter(openFilter === "price" ? null : "price")
        }
        className={`px-4 py-1 border rounded ${ (minPrice|| maxPrice)?"bg-blue-700 text-white":""}`}
      >
        Price
      </button>

      {(openFilter === "price") && (
        <div className="absolute left-0 mt-2 bg-neutral-100 border shadow-lg rounded rounded-t-none p-2 w-52">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border w-full px-2 py-1 mb-2"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
      )}
    </div>

    {/* CLEAR */}
    <button
      onClick={clearFilters}
      className="text-red-600 text-lg font-semibold underline"
    >
      Clear
    </button>

  </div>
</div>
        <div className="max-w-7xl mx-auto p-4 flex flex-col gap-6" onClick={()=>setOpenFilter(false)}>

        {/* ================= PRODUCT GRID ================= */}
        <div className="flex-1">

          {loading && (
            <div className="text-center py-10">Loading...</div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-10">
              No products found
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((item) => (
              <div
                key={item.variant_id}
                className="border rounded p-2 cursor-pointer"
                onClick={() =>
                  navigate(`/checkout?id=${item.variant_id}`)
                }
              >
                <img
                  src={item.image}
                  className="h-40 w-full object-contain"
                />
                <h3 className="text-sm font-semibold mt-2">
                  {item.product_name}
                </h3>
                <p className="text-green-600 font-bold">
                  ₹{item.price}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
