import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { logout } from "../../features/auth/authSlice";
import { Tent, LogOut, User as UserIcon, ShoppingBag } from "lucide-react";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="navbar bg-primary text-base-100 shadow-md px-4 sm:px-8">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl normal-case gap-2">
          <Tent className="h-8 w-8 text-accent" />
          <span className="font-bold tracking-tight">GearUp</span>
        </Link>
      </div>
      
      <div className="flex-none gap-4">
        <Link to="/gear" className="btn btn-ghost hover:text-accent">Browse Gear</Link>
        
        {(!user || user.role === "CUSTOMER") && (
          <Link to="/cart" className="btn btn-ghost btn-circle hover:text-accent">
            <div className="indicator">
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="badge badge-sm badge-accent indicator-item border-none text-white">{cartItemCount}</span>
              )}
            </div>
          </Link>
        )}
        
        {!user ? (
          <>
            <Link to="/login" className="btn btn-ghost hover:text-accent">Login</Link>
            <Link to="/register" className="btn btn-accent text-white">Register</Link>
          </>
        ) : (
          <>
            {user.role === "CUSTOMER" && <Link to="/dashboard" className="btn btn-ghost hover:text-accent">Dashboard</Link>}
            {user.role === "PROVIDER" && <Link to="/provider" className="btn btn-ghost hover:text-accent">Provider</Link>}
            {user.role === "ADMIN" && <Link to="/admin" className="btn btn-ghost hover:text-accent">Admin</Link>}
            
            <div className="divider divider-horizontal border-green-700 mx-0"></div>
            
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <span className="font-medium text-sm hidden sm:inline-block">{user.name}</span>
              <button onClick={handleLogout} aria-label="Logout" title="Logout" className="btn btn-ghost btn-circle hover:text-accent">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
