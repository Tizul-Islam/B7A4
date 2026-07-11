import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';
import { toast } from 'sonner';
import { Trash, Edit2, X } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Fetch Categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  // Sync editing category with form values
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        description: editingCategory.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [editingCategory, reset]);

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => api.categories.create(values),
    onSuccess: () => {
      toast.success('Category created successfully.');
      reset();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      if (err.errorDetails?.errorSource) {
        err.errorDetails.errorSource.forEach((e: any) => {
          const path = e.path.replace('body.', '') as keyof CategoryFormValues;
          setError(path, { type: 'server', message: e.message });
        });
      } else {
        toast.error(err.message || 'Failed to create category.');
      }
    },
  });

  // Update Category Mutation
  const updateMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      api.categories.update(editingCategory.id, values),
    onSuccess: () => {
      toast.success('Category updated successfully.');
      setEditingCategory(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      if (err.errorDetails?.errorSource) {
        err.errorDetails.errorSource.forEach((e: any) => {
          const path = e.path.replace('body.', '') as keyof CategoryFormValues;
          setError(path, { type: 'server', message: e.message });
        });
      } else {
        toast.error(err.message || 'Failed to update category.');
      }
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: () => {
      toast.success('Category deleted successfully.');
      if (editingCategory?.id === deleteMutation.variables) {
        setEditingCategory(null);
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete category.');
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    if (editingCategory) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Category Management</h1>
        <p className="text-sm text-slate-400">Add, edit, or remove outdoor gear categories</p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-8 items-start">
        {/* Creation / Edit Form */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg font-bold text-white">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
            {editingCategory && (
              <button
                type="button"
                title="Cancel Edit"
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                placeholder="Water Sports"
                {...register('name')}
              />
              {errors.name && <span className="text-xs text-rose-400 mt-1 block">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Description</label>
              <textarea
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                rows={3}
                placeholder="Kayaks, surfboards, and water safety accessories..."
                {...register('description')}
              />
            </div>

            <div className="flex gap-2">
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 rounded-xl border border-white/5 bg-slate-950 py-2.5 font-display text-sm font-bold text-slate-300 hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isFormSubmitting}
                className="flex-1 rounded-xl bg-accentTeal py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center justify-center"
              >
                {isFormSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : editingCategory ? (
                  'Save Changes'
                ) : (
                  'Create Category'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Categories List Table */}
        <DataTable
          headers={['Category Name', 'Description', 'Action']}
          data={categories}
          loading={isLoading}
          emptyMessage="No categories created on the platform yet."
          renderRow={(cat: any) => {
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === cat.id;
            const isEditingThis = editingCategory?.id === cat.id;

            return (
              <tr key={cat.id} className={isEditingThis ? 'bg-sky-500/5' : ''}>
                <td className="px-6 py-4 font-display text-sm font-bold text-white">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{cat.description || 'N/A'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Edit Category"
                      disabled={isDeleting}
                      onClick={() => setEditingCategory(cat)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-900/50 bg-sky-950/40 text-accentTeal hover:bg-sky-900 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      title="Delete Category"
                      disabled={isDeleting}
                      onClick={() => handleDelete(cat.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-900/50 bg-rose-950/40 text-rose-400 hover:bg-rose-900 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      {isDeleting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                      ) : (
                        <Trash size={14} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </div>
  );
};

export default AdminCategories;
