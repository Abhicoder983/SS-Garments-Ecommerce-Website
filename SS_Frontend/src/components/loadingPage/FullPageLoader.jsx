// src/components/common/FullPageLoader.jsx
//
// Full-screen loading overlay that blocks all interaction with the
// page underneath (clicks, scrolling, everything) until loading is done.
//
// Install first: npm install react-loader-spinner

import { ThreeDots } from "react-loader-spinner";

export default function FullPageLoader({ message = "Loading..." }) {
  return (
    <div
      className="
        fixed inset-0
        bg-white/20 backdrop-blur-sm
        flex flex-col items-center justify-center
        z-[9999]
      "
      // Blocks clicks from reaching anything behind it
      onClick={(e) => e.stopPropagation()}
    >
      <ThreeDots
        visible={true}
        height="60"
        width="60"
        color="green"
        radius="9"
        ariaLabel="three-dots-loading"
      />

      <p className="mt-6 text-black text-2xl tracking-wide">
        {message}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------
   USAGE — anywhere you need to block the whole page during a request:

   import { useState } from "react";
   import FullPageLoader from "./components/common/FullPageLoader";

   function SomeComponent() {
     const [loading, setLoading] = useState(false);

     const handleAction = async () => {
       setLoading(true);
       try {
         await axios.post(...);
       } finally {
         setLoading(false);
       }
     };

     return (
       <>
         {loading && <FullPageLoader message="Signing you in..." />}
         <button onClick={handleAction}>Continue with Google</button>
       </>
     );
   }

   Design notes:
   - "fixed inset-0" makes it cover the ENTIRE viewport regardless of
     scroll position — top, bottom, left, right all pinned to screen edges
   - "z-[9999]" ensures it renders above navbar, modals, everything else
   - "bg-black/80 backdrop-blur-sm" dims + blurs the page behind it,
     visually signaling "this page is temporarily unavailable"
   - Since it's a full opaque-ish overlay sitting on top of everything,
     clicks on buttons/links underneath physically can't register —
     the overlay div itself absorbs all pointer events
   - Gold spinner color (#c9a24b) matches your site's accent theme
------------------------------------------------------------------- */
