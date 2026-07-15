import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navbar } from "./components/common/Navbar";
import { Login } from "./features/auth/Login";
import { Register } from "./features/auth/Register";
import { GearList } from "./features/gear/GearList";
import { GearDetails } from "./features/gear/GearDetails";
import { Cart } from "./features/cart/Cart";
import { Checkout } from "./features/checkout/Checkout";
import { PaymentResult } from "./features/checkout/PaymentResult";
import { PaymentCancel } from "./features/checkout/PaymentCancel";
import { CustomerLayout } from "./features/dashboard/CustomerLayout";
import { CustomerProfile } from "./features/dashboard/CustomerProfile";
import { PaymentHistory } from "./features/payments/PaymentHistory";
import { PaymentDetails } from "./features/payments/PaymentDetails";
import { AdminLayout } from "./features/admin/AdminLayout";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { UserManagement } from "./features/admin/UserManagement";
import { CategoryManagement } from "./features/admin/CategoryManagement";
import { AdminRentals } from "./features/admin/AdminRentals";
import { AdminGear } from "./features/admin/AdminGear";
import { MyRentals } from "./features/rentals/MyRentals";
import { RentalDetails } from "./features/rentals/RentalDetails";
import { ProviderLayout } from "./features/provider/ProviderLayout";
import { ProviderGearList } from "./features/provider/ProviderGearList";
import { GearForm } from "./features/provider/GearForm";
import { ProviderOrders } from "./features/provider/ProviderOrders";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import api from "./services/api";
import { setUser, setLoading } from "./features/auth/authSlice";
import type { RootState } from "./store";

function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data.success && response.data.data) {
          dispatch(setUser(response.data.data));
        }
      } catch {
        // Silent fail, user just stays logged out
      } finally {
        dispatch(setLoading(false));
      }
    };

    hydrateUser();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-base-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<div className="p-8 text-center"><h1 className="text-4xl font-bold">Welcome to GearUp!</h1></div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/gear" element={<GearList />} />
            <Route path="/gear/:id" element={<GearDetails />} />
            <Route path="/cart" element={<Cart />} />

            {/* Customer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<PaymentResult />} />
              <Route path="/cancel" element={<PaymentCancel />} />
              
              <Route element={<CustomerLayout />}>
                <Route path="/dashboard" element={<Navigate to="/rentals" replace />} />
                <Route path="/rentals" element={<MyRentals />} />
                <Route path="/rentals/:id" element={<RentalDetails />} />
                <Route path="/payments" element={<PaymentHistory />} />
                <Route path="/payments/:id" element={<PaymentDetails />} />
                <Route path="/profile" element={<CustomerProfile />} />
              </Route>
            </Route>

            {/* Provider Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["PROVIDER"]} />}>
              <Route path="/provider" element={<ProviderLayout />}>
                <Route index element={<div className="p-8">Provider Dashboard Stats</div>} />
                <Route path="gear" element={<ProviderGearList />} />
                <Route path="gear/new" element={<GearForm />} />
                <Route path="gear/:id/edit" element={<GearForm />} />
                <Route path="orders" element={<ProviderOrders />} />
              </Route>
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="rentals" element={<AdminRentals />} />
                <Route path="gear" element={<AdminGear />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
