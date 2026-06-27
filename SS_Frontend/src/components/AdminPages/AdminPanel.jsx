import { BarChart2, ShoppingCart, Users, Package, Tag, Settings, Bell, Search } from "lucide-react";

export default function AdminPanel() {

  return (
    <div className="flex min-h-screen bg-[#f6efe8]">
{/* Sidebar */}
<aside className="w-64 bg-white p-6">
<h1 className="text-xl font-bold text-orange-500 mb-8">SS Garments</h1>
<nav className="space-y-4 text-gray-600">
<div className="flex items-center gap-3 text-orange-500 font-semibold">
<BarChart2 size={18} /> Dashboard
</div>
<div className="flex items-center gap-3"><ShoppingCart size={18}/> Orders</div>
<div className="flex items-center gap-3"><Package size={18}/> Products</div>
<div className="flex items-center gap-3"><Users size={18}/> Customers</div>
<div className="flex items-center gap-3"><Tag size={18}/> Discounts</div>
<div className="flex items-center gap-3"><Settings size={18}/> Settings</div>
</nav>
</aside>


{/* Main */}
<main className="flex-1 p-6">
{/* Top bar */}
<div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-semibold">Dashboard</h2>
<div className="flex items-center gap-4">
<div className="relative">
</div>
<Bell />
<img src="https://i.pravatar.cc/40" className="rounded-full" />
</div>
</div>


{/* Stats */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
<StatCard title="Total Sales" value="$983,410" />
<StatCard title="Total Orders" value="58,375" />
<StatCard title="Total Visitors" value="237,782" />
</div>


{/* Charts placeholders */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 bg-white rounded-xl p-6">
<h3 className="font-semibold mb-4">Revenue Analytics</h3>
<div className="h-48 bg-orange-100 rounded-lg flex items-center justify-center text-orange-400">Chart</div>
</div>
<div className="bg-white rounded-xl p-6">
<h3 className="font-semibold mb-4">Top Categories</h3>
<div className="h-48 bg-orange-100 rounded-lg flex items-center justify-center text-orange-400">Chart</div>
</div>
</div>
</main>
</div>
  )
}
