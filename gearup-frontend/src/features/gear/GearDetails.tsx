import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addItem } from "../cart/cartSlice";
import api from "../../services/api";

export const GearDetails = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["gear", id],
    queryFn: async () => {
      const response = await api.get(`/gear/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const response = await api.get(`/gear/${id}/reviews`);
      return response.data;
    },
    enabled: !!id,
  });

  const reviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="alert alert-error">
          <span>Failed to load gear details. It might have been removed.</span>
        </div>
        <Link to="/gear" className="btn mt-4">Back to Gear</Link>
      </div>
    );
  }

  const gear = data.data;

  const handleAddToBag = () => {
    dispatch(addItem({
      gearItem: {
        id: gear.id,
        name: gear.name,
        brand: gear.brand,
        pricePerDay: Number(gear.pricePerDay),
        availableQuantity: gear.availableQuantity,
        images: gear.images,
        providerId: gear.providerId
      },
      quantity
    }));
    toast.success(`${quantity} ${gear.name} added to bag!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-8">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/gear">Gear</Link></li>
          <li>{gear.name}</li>
        </ul>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Images Section */}
        <div className="w-full lg:w-1/2">
          {gear.images && gear.images.length > 0 ? (
            <div className="grid gap-4">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-base-200">
                <img src={gear.images[0]} alt={gear.name} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {gear.images.slice(1, 5).map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border border-base-200 cursor-pointer hover:opacity-80">
                    <img src={img} alt={`${gear.name} view ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-base-200 flex items-center justify-center">
              <span className="text-gray-400">No Image Available</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-ink mb-2">{gear.name}</h1>
            <p className="text-xl text-gray-500">{gear.brand}</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">${Number(gear.pricePerDay).toFixed(2)}</span>
            <span className="text-gray-500">/ day</span>
            {gear.isAvailable ? (
              <div className="badge badge-success gap-1 text-white p-3 font-semibold">In Stock</div>
            ) : (
              <div className="badge badge-error gap-1 text-white p-3 font-semibold">Unavailable</div>
            )}
          </div>

          <div className="divider"></div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="whitespace-pre-wrap text-gray-600">{gear.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 bg-base-200 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Category</p>
              <p>{gear.category?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Condition</p>
              <p>{gear.condition}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Available Stock</p>
              <p>{gear.availableQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Provider</p>
              <p>{gear.provider?.name}</p>
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 border border-base-300 rounded-lg bg-base-100 p-1">
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setQuantity(Math.min(gear.availableQuantity, quantity + 1))}
                disabled={quantity >= gear.availableQuantity}
              >+</button>
            </div>
            <button 
              className="btn btn-primary flex-1 btn-lg"
              disabled={!gear.isAvailable || gear.availableQuantity <= 0}
              onClick={handleAddToBag}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="border-t border-base-200 pt-16 mt-16">
        <h2 className="text-3xl font-bold text-ink mb-8">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className="bg-base-200 p-8 rounded-xl text-center">
            <p className="text-gray-500">No reviews yet. Be the first to rent and review this gear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-bold text-ink">{review.customer?.name || "Anonymous User"}</div>
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                <div className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
