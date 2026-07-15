import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { RootState } from "../../store";
import { removeItem, updateQuantity, setDates } from "./cartSlice";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const Cart = () => {
  const { items, startDate, endDate } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDateChange = (type: "start" | "end", value: string) => {
    dispatch(setDates({
      startDate: type === "start" ? value : startDate,
      endDate: type === "end" ? value : endDate,
    }));
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const days = calculateDays();

  const subtotal = items.reduce(
    (total, item) => total + item.gearItem.pricePerDay * item.quantity,
    0
  );
  
  const totalAmount = subtotal * (days > 0 ? days : 1); // Show 1-day equivalent if no dates set

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to proceed to checkout");
      navigate("/login");
      return;
    }
    if (!startDate || !endDate || days <= 0) {
      toast.error("Please select valid rental dates");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-ink mb-8">Your Rental Bag</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Your bag is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any gear yet.</p>
          <Link to="/gear" className="btn btn-primary">Browse Gear</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Items and Dates */}
          <div className="flex-1 space-y-8">
            
            {/* Date Range Selector */}
            <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200">
              <h2 className="text-xl font-bold mb-4">Rental Period (Applies to all items)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="startDate">
                    <span className="label-text font-semibold">Start Date</span>
                  </label>
                  <input 
                    id="startDate"
                    title="Rental Start Date"
                    aria-label="Rental Start Date"
                    type="date" 
                    className="input input-bordered w-full"
                    value={startDate || ""}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="endDate">
                    <span className="label-text font-semibold">End Date</span>
                  </label>
                  <input 
                    id="endDate"
                    title="Rental End Date"
                    aria-label="Rental End Date"
                    type="date" 
                    className="input input-bordered w-full"
                    value={endDate || ""}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                  />
                </div>
              </div>
              {days > 0 ? (
                <div className="mt-4 text-success font-semibold">
                  Valid duration: {days} day{days !== 1 ? 's' : ''}
                </div>
              ) : startDate && endDate ? (
                <div className="mt-4 text-error font-semibold">
                  End date must be after start date
                </div>
              ) : (
                <div className="mt-4 text-gray-500 text-sm">
                  Please select your dates to calculate the final total.
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200">
              <h2 className="text-xl font-bold mb-4">Gear Items ({items.length})</h2>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.gearItem.id} className="flex gap-4 pb-6 border-b border-base-200 last:border-0 last:pb-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-base-200">
                      {item.gearItem.images?.[0] ? (
                        <img src={item.gearItem.images[0]} alt={item.gearItem.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg"><Link to={`/gear/${item.gearItem.id}`} className="hover:text-primary">{item.gearItem.name}</Link></h3>
                          <p className="text-sm text-gray-500">{item.gearItem.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${item.gearItem.pricePerDay} / day</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 border border-base-300 rounded-lg p-1 w-fit">
                          <button 
                            className="btn btn-xs btn-ghost" 
                            onClick={() => dispatch(updateQuantity({ id: item.gearItem.id, quantity: Math.max(1, item.quantity - 1) }))}
                          >-</button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button 
                            className="btn btn-xs btn-ghost"
                            disabled={item.quantity >= item.gearItem.availableQuantity}
                            onClick={() => dispatch(updateQuantity({ id: item.gearItem.id, quantity: item.quantity + 1 }))}
                          >+</button>
                        </div>
                        
                        <button 
                          title="Remove item"
                          aria-label="Remove item"
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => dispatch(removeItem(item.gearItem.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Items subtotal (per day)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rental duration</span>
                  <span className="font-medium">{days > 0 ? `${days} days` : "-"}</span>
                </div>
              </div>
              
              <div className="divider my-4"></div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              
              <button 
                className="btn btn-primary w-full btn-lg"
                onClick={handleCheckout}
                disabled={days <= 0}
              >
                Proceed to Checkout
              </button>
              
              {!startDate || !endDate ? (
                <p className="text-xs text-center text-gray-500 mt-4">
                  Select rental dates to proceed
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
