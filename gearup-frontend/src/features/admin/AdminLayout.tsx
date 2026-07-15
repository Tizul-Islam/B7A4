import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Tags, 
  Package, 
  ShoppingBag
} from "lucide-react";

export const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path ? "active bg-primary text-white" : "";
    }
    return location.pathname.includes(path) ? "active bg-primary text-white" : "";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-base-200">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-base-100 shadow-sm border-r border-base-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Admin Panel
          </h2>
        </div>
        <ul className="menu bg-base-100 w-full p-2 gap-2 text-base">
          <li>
            <Link to="/admin" className={isActive("/admin", true)}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className={isActive("/admin/users")}>
              <Users className="w-5 h-5" />
              Users
            </Link>
          </li>
          <li>
            <Link to="/admin/categories" className={isActive("/admin/categories")}>
              <Tags className="w-5 h-5" />
              Categories
            </Link>
          </li>
          <li>
            <Link to="/admin/gear" className={isActive("/admin/gear")}>
              <Package className="w-5 h-5" />
              Gear Listings
            </Link>
          </li>
          <li>
            <Link to="/admin/rentals" className={isActive("/admin/rentals")}>
              <ShoppingBag className="w-5 h-5" />
              Rentals
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
