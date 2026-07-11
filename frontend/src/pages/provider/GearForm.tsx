import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { toast } from 'sonner';

const gearSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().min(1, 'Description is required'),
  pricePerDay: z.number().positive('Price must be greater than zero'),
  stockQuantity: z.number().int().nonnegative('Stock must be 0 or more'),
  condition: z.enum(['NEW', 'GOOD', 'FAIR']),
  categoryId: z.string().uuid('Please select a valid category'),
  imageUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
});

type GearFormValues = z.infer<typeof gearSchema>;

export const GearForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });
  const categories = categoriesData?.data || [];

  // Fetch Gear details (if Edit Mode)
  const { data: gearData, isLoading: loadingDetails } = useQuery({
    queryKey: ['gearDetails', id],
    queryFn: () => api.gear.getById(id!),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<GearFormValues>({
    resolver: zodResolver(gearSchema),
  });

  // Prepopulate form on Edit Mode loaded
  useEffect(() => {
    if (isEditMode && gearData?.data) {
      const gear = gearData.data;
      reset({
        name: gear.name,
        brand: gear.brand,
        description: gear.description,
        pricePerDay: gear.pricePerDay,
        stockQuantity: gear.stockQuantity,
        condition: gear.condition,
        categoryId: gear.categoryId,
        imageUrl: gear.images?.[0] || '',
      });
    }
  }, [gearData, isEditMode, reset]);

  // Mutation: Create/Update Gear Listing
  const mutation = useMutation({
    mutationFn: (values: GearFormValues) => {
      const payload = {
        name: values.name,
        brand: values.brand,
        description: values.description,
        pricePerDay: values.pricePerDay,
        stockQuantity: values.stockQuantity,
        condition: values.condition,
        categoryId: values.categoryId,
        images: values.imageUrl ? [values.imageUrl] : [],
      };

      return isEditMode
        ? api.gear.providerUpdate(id!, payload)
        : api.gear.providerCreate(payload);
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Equipment listing updated.' : 'Equipment listed successfully!');
      queryClient.invalidateQueries({ queryKey: ['providerGears'] });
      navigate('/provider/gear');
    },
    onError: (err: any) => {
      if (err.errorDetails?.errorSource) {
        err.errorDetails.errorSource.forEach((e: any) => {
          const path = e.path.replace('body.', '') as keyof GearFormValues;
          setError(path, { type: 'server', message: e.message });
        });
      } else {
        toast.error(err.message || 'Action failed.');
      }
    },
  });

  const onSubmit = (values: GearFormValues) => {
    mutation.mutate(values);
  };

  if (isEditMode && loadingDetails) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            {isEditMode ? 'Edit Equipment Listing' : 'List Outdoor Equipment'}
          </h1>
          <p className="text-sm text-slate-400">
            {isEditMode ? 'Modify equipment details, pricing, and availability' : 'Provide high-quality gear for outdoor adventurers'}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2 font-display text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Gear Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                placeholder="4-Person Waterproof Dome Tent"
                {...register('name')}
              />
              {errors.name && <span className="text-xs text-rose-400 mt-1 block">{errors.name.message}</span>}
            </div>
            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Brand</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                placeholder="Coleman"
                {...register('brand')}
              />
              {errors.brand && <span className="text-xs text-rose-400 mt-1 block">{errors.brand.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Description</label>
            <textarea
              className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
              rows={4}
              placeholder="Provide a detailed description of the gear features, cleanliness, and specifications..."
              {...register('description')}
            />
            {errors.description && <span className="text-xs text-rose-400 mt-1 block">{errors.description.message}</span>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Price Per Day ($)</label>
              <input
                type="number"
                step="0.5"
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                placeholder="15.00"
                {...register('pricePerDay', { valueAsNumber: true })}
              />
              {errors.pricePerDay && <span className="text-xs text-rose-400 mt-1 block">{errors.pricePerDay.message}</span>}
            </div>
            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Stock Quantity</label>
              <input
                type="number"
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                placeholder="3"
                {...register('stockQuantity', { valueAsNumber: true })}
              />
              {errors.stockQuantity && <span className="text-xs text-rose-400 mt-1 block">{errors.stockQuantity.message}</span>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Condition</label>
              <select
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                {...register('condition')}
              >
                <option value="NEW">New (Unused)</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
              {errors.condition && <span className="text-xs text-rose-400 mt-1 block">{errors.condition.message}</span>}
            </div>
            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Category</label>
              <select
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                {...register('categoryId')}
              >
                <option value="">Select a Category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="text-xs text-rose-400 mt-1 block">{errors.categoryId.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Image URL</label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
              placeholder="https://images.unsplash.com/photo-..."
              {...register('imageUrl')}
            />
            {errors.imageUrl && <span className="text-xs text-rose-400 mt-1 block">{errors.imageUrl.message}</span>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl bg-accentTeal px-6 py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center justify-center min-w-[140px]"
          >
            {mutation.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'List Equipment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default GearForm;
