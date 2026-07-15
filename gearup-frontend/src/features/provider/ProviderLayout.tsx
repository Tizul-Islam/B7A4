import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, ListOrdered, BarChart2 } from "lucide-react";

export const ProviderLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path) ? "active bg-primary text-white" : "";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-base-200">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-base-100 shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary">Provider Panel</h2>
        </div>
        <ul className="menu bg-base-100 w-full p-2 gap-2">
          <li>
            <Link to="/provider" className={location.pathname === "/provider" ? "active bg-primary text-white" : ""}>
              <BarChart2 className="w-5 h-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/provider/gear" className={isActive("/provider/gear")}>
              <Package className="w-5 h-5" />
              My Inventory
            </Link>
          </li>
          <li>
            <Link to="/provider/orders" className={isActive("/provider/orders")}>
              <ListOrdered className="w-5 h-5" />
              Incoming Orders
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
