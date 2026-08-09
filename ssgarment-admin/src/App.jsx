// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import Categories from './pages/Categories/Categories';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetail from './pages/Customers/CustomerDetail';
import Inventory from './pages/Inventory/Inventory';
import CouponList from './pages/Coupons/CouponList';
import AddCoupon from './pages/Coupons/AddCoupon';
import Notifications from './pages/Notifications/Notifications';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes - Layout ke andar */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/products" element={<ProductList />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />

          <Route path="/categories" element={<Categories />} />

          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers-details/:id" element={<CustomerDetail />} />

          <Route path="/inventory" element={<Inventory />} />

          <Route path="/coupons" element={<CouponList />} />
          <Route path="/coupons/add" element={<AddCoupon />} />

          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}