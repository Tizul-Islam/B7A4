import { Link } from "react-router-dom";

interface GearItem {
  id: string;
  name: string;
  brand: string;
  pricePerDay: string | number;
  images: string[];
  isAvailable: boolean;
  category?: { name: string };
}

interface GearCardProps {
  gear: GearItem;
}

export const GearCard = ({ gear }: GearCardProps) => {
  const imageUrl = gear.images && gear.images.length > 0 ? gear.images[0] : "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group h-full">
      <figure className="relative aspect-[4/3] overflow-hidden bg-base-200">
        <img 
          src={imageUrl} 
          alt={gear.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { 
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('data:image/svg+xml')) {
              target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EInvalid%3C%2Ftext%3E%3C%2Fsvg%3E';
            }
          }}
        />
        {!gear.isAvailable && (
          <div className="absolute inset-0 bg-base-300 bg-opacity-60 flex items-center justify-center">
            <span className="badge badge-error badge-lg font-bold">Currently Rented Out</span>
          </div>
        )}
      </figure>
      
      <div className="card-body p-5 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="card-title text-lg font-bold line-clamp-1" title={gear.name}>
            {gear.name}
          </h2>
          <div className="badge badge-primary badge-outline text-xs whitespace-nowrap ml-2">
            ${Number(gear.pricePerDay).toFixed(2)}/day
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-1">{gear.brand} • {gear.category?.name || "Gear"}</p>
        
        <div className="mt-auto card-actions justify-end">
          <Link to={`/gear/${gear.id}`} className="btn btn-primary w-full">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
