import { Link, Outlet, useLocation } from "react-router-dom";
import { ShoppingBag, User, Home, CreditCard } from "lucide-react";

export const CustomerLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path) ? "active bg-primary text-white" : "";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-base-200">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-base-100 shadow-sm border-r border-base-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Home className="w-5 h-5" />
            My Dashboard
          </h2>
        </div>
        <ul className="menu bg-base-100 w-full p-2 gap-2 text-base">
          <li>
            <Link to="/rentals" className={isActive("/rentals")}>
              <ShoppingBag className="w-5 h-5" />
              My Rentals
            </Link>
          </li>
          <li>
            <Link to="/payments" className={isActive("/payments")}>
              <CreditCard className="w-5 h-5" />
              Payment History
            </Link>
          </li>
          <li>
            <Link to="/profile" className={isActive("/profile")}>
              <User className="w-5 h-5" />
              Profile Settings
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};
