import menu from "../assets/homeAssests/navBar/menu.png"
import close from "../assets/homeAssests/navBar/close.png"
import discount from "../assets/homeAssests/navBar/discount.png"
import account from "../assets/homeAssests/navBar/account.png"
import searchImage from "../assets/homeAssests/navBar/search.png"
import cart from "../assets/homeAssests/navBar/cart.png"
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../Context/StoreContext.jsx";
import { useContext, useState } from "react"
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify"
export default function NavBar(){
    const {openMenu,setOpenMenu}=useContext(StoreContext)
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const navigate = useNavigate()

   

    const handleSearch = async(e) => {
      if (e.key==='Enter'){
        const params = new URLSearchParams()
        if(search) {
          params.set('search', search)
            setSearchParams(params);
        navigate(`/products?${params.toString()}`);
        return 
       
        
        }
        else toast.warning('Enter something to search')
        return 


      }


    }



    
  
    return(
        <>
       <nav className="sticky top-0 w-full h-fit bg-linear-to-r from-black via-gray-900 to-gray-700 text-white p-1.5 flex justify-around items-center z-20">
                    <div>
                       <img src={openMenu?close:menu} className='sm:w-10 w-5 sm:h-8 h-7 ' onClick={()=>setOpenMenu((prevMenu)=>!prevMenu)} />
                   </div>
                   <div className=" sm:text-2xl text-xl"> SS Garments</div>
       
                  <div className="w-2/6 border-2 border-white rounded-xl bg-white flex items-center gap-2 px-3 py-1">
       
                       <input type="text"
           placeholder="Searching any item"
           className="text-xl text-black border-none outline-none w-full"
        onChange={(e)=>setSearch(e.target.value)} onKeyDown={handleSearch} value={search}/>
         <img src={searchImage} className="w-6 h-6" alt="search" />
       </div>
                   <div>
                       <img src={discount} className="sm:w-10 w-5 md:h-8 h-7"alt="" />
                   </div>
                   <div>
                       <Link to="/cart"><img src={cart} className="sm:w-10 w-5 md:h-8 h-7"alt="" /></Link>
                   </div>
                   <div>
                       <Link to="/account"><img src={account} className="sm:w-10 w-5 md:h-8 h-7"alt="" /></Link>
                   </div>
                   
                   
               </nav>
                <div
        className={`fixed top-10  overflow-scroll left-0 inset-0 bg-black/70 backdrop-blur-sm h-full w-full text-white z-40 p-5 transform transition-transform duration-300 ${
          openMenu ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={()=>setOpenMenu(prev=>!prev)}>
         <ul className="space-y-4 text-lg">
          <li><Link to="/">Home</Link></li>
          <li>Shop</li>
          <li>About</li>
          <li>Contact</li>
          </ul>
        
      </div>
     
      </>
    ) 
}