// src/components/Layout.jsx
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">SS Garments Admin</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/coupons">Coupons</Link>
          <Link to="/notifications">Notifications</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}