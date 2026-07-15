import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../services/api";

const gearSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required (min 10 chars)"),
  brand: z.string().min(1, "Brand is required"),
  categoryId: z.string().uuid("Invalid category"),
  pricePerDay: z.number().min(1, "Price must be greater than 0"),
  stockQuantity: z.number().min(1, "Stock must be at least 1"),
  condition: z.enum(["NEW", "GOOD", "FAIR"]),
  isAvailable: z.boolean(),
  images: z.array(z.string().url()).min(1, "At least one image URL is required"),
});

type GearFormType = z.infer<typeof gearSchema>;

export const GearForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data;
    }
  });

  const { data: gearData, isLoading: isLoadingGear } = useQuery({
    queryKey: ["gear", id],
    queryFn: async () => {
      const res = await api.get(`/gear/${id}`);
      return res.data.data;
    },
    enabled: isEditMode,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<GearFormType>({
    resolver: zodResolver(gearSchema),
    defaultValues: {
      condition: "GOOD",
      isAvailable: true,
      images: [],
    }
  });

  useEffect(() => {
    if (isEditMode && gearData) {
      reset({
        name: gearData.name,
        description: gearData.description,
        brand: gearData.brand,
        categoryId: gearData.categoryId || gearData.category?.id,
        pricePerDay: Number(gearData.pricePerDay),
        stockQuantity: gearData.stockQuantity,
        condition: gearData.condition,
        isAvailable: gearData.isAvailable,
        images: gearData.images || [],
      });
      if (gearData.images?.length > 0) {
        setImageUrls(gearData.images);
      }
    }
  }, [isEditMode, gearData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: GearFormType) => {
      if (isEditMode) {
        return api.put(`/provider/gear/${id}`, data);
      } else {
        return api.post("/provider/gear", data);
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Gear updated successfully" : "Gear added successfully");
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
      queryClient.invalidateQueries({ queryKey: ["gear"] });
      navigate("/provider/gear");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save gear");
    },
  });

  const onSubmit = (data: GearFormType) => {
    // Filter out empty image URLs
    const validImages = imageUrls.filter(url => url.trim() !== "");
    if (validImages.length === 0) {
      toast.error("Please provide at least one valid image URL");
      return;
    }
    data.images = validImages;
    mutation.mutate(data);
  };

  const handleImageChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setValue("images", newUrls.filter(u => u !== ""));
  };

  const addImageField = () => setImageUrls([...imageUrls, ""]);
  const removeImageField = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length ? newUrls : [""]);
    setValue("images", newUrls.filter(u => u !== ""));
  };

  if (isEditMode && isLoadingGear) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">{isEditMode ? "Edit Gear" : "Add New Gear"}</h2>
        <Link to="/provider/gear" className="btn btn-ghost">Cancel</Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Gear Name</span></label>
              <input type="text" className={`input input-bordered ${errors.name ? 'input-error' : ''}`} {...register("name")} />
              {errors.name && <span className="label-text-alt text-error mt-1">{errors.name.message}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Brand</span></label>
              <input type="text" className={`input input-bordered ${errors.brand ? 'input-error' : ''}`} {...register("brand")} />
              {errors.brand && <span className="label-text-alt text-error mt-1">{errors.brand.message}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Category</span></label>
              <select className={`select select-bordered ${errors.categoryId ? 'select-error' : ''}`} {...register("categoryId")}>
                <option value="">Select a category</option>
                {categoriesData?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <span className="label-text-alt text-error mt-1">{errors.categoryId.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Price / Day ($)</span></label>
                <input type="number" step="0.01" className={`input input-bordered ${errors.pricePerDay ? 'input-error' : ''}`} {...register("pricePerDay", { valueAsNumber: true })} />
                {errors.pricePerDay && <span className="label-text-alt text-error mt-1">{errors.pricePerDay.message}</span>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Stock Quantity</span></label>
                <input type="number" className={`input input-bordered ${errors.stockQuantity ? 'input-error' : ''}`} {...register("stockQuantity", { valueAsNumber: true })} />
                {errors.stockQuantity && <span className="label-text-alt text-error mt-1">{errors.stockQuantity.message}</span>}
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Condition</span></label>
              <select className="select select-bordered" {...register("condition")}>
                <option value="NEW">New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>

            <div className="form-control flex-row items-center gap-3 mt-4 p-4 bg-base-200 rounded-lg">
              <input type="checkbox" className="toggle toggle-success" {...register("isAvailable")} />
              <span className="label-text font-semibold">Listing is Active & Available</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="form-control h-full">
              <label className="label"><span className="label-text font-semibold">Description</span></label>
              <textarea 
                className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`} 
                {...register("description")}
              ></textarea>
              {errors.description && <span className="label-text-alt text-error mt-1">{errors.description.message}</span>}
            </div>

            <div className="form-control">
              <label className="label flex justify-between">
                <span className="label-text font-semibold">Image URLs</span>
                <button type="button" onClick={addImageField} className="text-xs text-primary font-bold hover:underline">
                  + Add Image
                </button>
              </label>
              
              <div className="space-y-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      className="input input-bordered input-sm w-full"
                    />
                    {imageUrls.length > 1 && (
                      <button type="button" onClick={() => removeImageField(idx)} className="btn btn-sm btn-square btn-error btn-outline">×</button>
                    )}
                  </div>
                ))}
              </div>
              {errors.images && <span className="label-text-alt text-error mt-1">{errors.images.message}</span>}
              
              {/* Image Preview */}
              {imageUrls[0] && (
                <div className="mt-4 p-2 border border-base-200 rounded-lg aspect-video bg-base-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src={imageUrls[0]} 
                    alt="Preview" 
                    className="max-h-full object-contain"
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('data:image/svg+xml')) {
                        target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EInvalid%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="divider"></div>
        
        <div className="flex justify-end gap-4">
          <Link to="/provider/gear" className="btn btn-outline">Cancel</Link>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary px-8">
            {mutation.isPending && <span className="loading loading-spinner"></span>}
            {isEditMode ? "Update Gear" : "Publish Gear"}
          </button>
        </div>
      </form>
    </div>
  );
};
