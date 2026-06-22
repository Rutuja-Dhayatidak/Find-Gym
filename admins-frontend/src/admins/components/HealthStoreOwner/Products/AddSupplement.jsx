import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addProduct, getProductById, updateProduct } from '../../../../services/healthStoreOwnerApi';

const CATEGORIES = ['Whey Protein', 'Creatine', 'Mass Gainer', 'Pre Workout', 'Multivitamin', 'Fat Burner', 'BCAA', 'Fish Oil'];

const AddSupplement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', category: 'Whey Protein', brand: '',
    shortDescription: '', description: '', benefits: '', suitableFor: '',
    ingredients: '', howToUse: '', isReturnable: false, deliveryAvailable: true,
    submitForApproval: false
  });

  const [variants, setVariants] = useState([
    { flavor: 'Unflavored', size: '1kg', mrp: '', sellingPrice: '', stock: '50', lowStockAlert: '5', sku: '' }
  ]);

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        setFetching(true);
        try {
          const res = await getProductById(id);
          const p = res.data.data;
          setForm({
            name: p.name || '',
            category: p.category || 'Whey Protein',
            brand: p.brand || '',
            shortDescription: p.shortDescription || '',
            description: p.description || '',
            benefits: p.benefits?.join('\n') || '',
            suitableFor: p.suitableFor?.join('\n') || '',
            ingredients: p.ingredients || '',
            howToUse: p.howToUse || '',
            isReturnable: p.isReturnable || false,
            deliveryAvailable: p.deliveryAvailable !== false,
            submitForApproval: false
          });

          setExistingImages(p.images || []);

          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants.map(v => ({
              flavor: v.flavor || '',
              size: v.size || '',
              mrp: v.mrp !== undefined ? v.mrp : '',
              sellingPrice: v.sellingPrice !== undefined ? v.sellingPrice : '',
              stock: v.stock !== undefined ? v.stock : '',
              lowStockAlert: v.lowStockAlert !== undefined ? v.lowStockAlert : '',
              sku: v.sku || ''
            })));
          } else {
            setVariants([{
              flavor: p.flavor || 'Unflavored',
              size: p.quantity || '1kg',
              mrp: p.originalPrice || '',
              sellingPrice: p.sellingPrice || '',
              stock: p.stock || '50',
              lowStockAlert: p.lowStockAlert || '5',
              sku: ''
            }]);
          }
        } catch (err) {
          toast.error('Failed to load product details');
          navigate('/health-store-owner/supplements/list');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      { flavor: '', size: '', mrp: '', sellingPrice: '', stock: '0', lowStockAlert: '5', sku: '' }
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.error("At least one variant is required");
    }
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(prev => {
      const updated = [...prev, ...selectedFiles];
      if (updated.length + existingImages.length > 10) {
        toast.error("You can upload a maximum of 10 images in total");
        return prev;
      }
      return updated;
    });
  };

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (variants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.size) {
        toast.error(`Variant #${i + 1} size is required`);
        return;
      }
      if (v.mrp === '' || v.sellingPrice === '' || v.stock === '') {
        toast.error(`Variant #${i + 1} pricing and stock details are required`);
        return;
      }
      if (parseFloat(v.sellingPrice) > parseFloat(v.mrp)) {
        toast.error(`Variant #${i + 1} selling price cannot exceed MRP`);
        return;
      }
      if (parseInt(v.stock) < 0) {
        toast.error(`Variant #${i + 1} stock cannot be negative`);
        return;
      }
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('productType', 'Supplement');

    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

    if (isEdit) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    const processedVariants = variants.map(v => {
      let finalSku = v.sku?.trim();
      if (!finalSku) {
        const cleanName = form.name.replace(/\s+/g, '-').toUpperCase();
        const cleanFlavor = (v.flavor || 'UNFLAVORED').replace(/\s+/g, '-').toUpperCase();
        const cleanSize = (v.size || '1KG').replace(/\s+/g, '-').toUpperCase();
        finalSku = `${cleanName}-${cleanFlavor}-${cleanSize}`;
      }
      return {
        ...v,
        mrp: parseFloat(v.mrp),
        sellingPrice: parseFloat(v.sellingPrice),
        stock: parseInt(v.stock),
        lowStockAlert: v.lowStockAlert !== '' ? parseInt(v.lowStockAlert) : 5,
        sku: finalSku
      };
    });

    formData.append('variants', JSON.stringify(processedVariants));

    images.forEach(img => {
      formData.append('images', img);
    });

    try {
      if (isEdit) {
        await updateProduct(id, formData);
        toast.success('Supplement updated successfully!');
      } else {
        await addProduct(formData);
        toast.success(form.submitForApproval ? 'Supplement submitted for approval!' : 'Supplement saved as Draft!');
      }
      navigate('/health-store-owner/supplements/list');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-4 border-red-650 border-t-transparent rounded-full mb-3" />
        <p className="text-gray-500 text-sm">Fetching product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/health-store-owner/supplements/list')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border">
          🔙 Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Supplement Listing' : 'Add Supplement Listing'}</h2>
          <p className="text-gray-500 text-xs mt-0.5">Define supplement specs, branding, pricing, and stock details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Supplement Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. 100% Whey Gold Standard"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Brand *</label>
            <input name="brand" value={form.brand} onChange={handleChange} required placeholder="e.g. Optimum Nutrition"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        {/* Description / Info */}
        <div className="space-y-4 border-t pt-5">
          <h4 className="text-sm font-bold text-gray-750">Product Description & Specs</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Short Summary *</label>
              <input name="shortDescription" value={form.shortDescription} onChange={handleChange} required placeholder="Brief tag line summary of supplement benefits"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Detailed Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe product details, certifications, authenticity..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Key Benefits (One per line)</label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={3} placeholder="24g of pure whey protein per scoop&#10;Supports muscle recovery"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="space-y-4 border-t pt-5">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-gray-750">Product Variants</h4>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs font-bold bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              ➕ Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-4 relative group hover:border-red-200 transition-all">
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:text-red-750 bg-white hover:bg-red-50 border border-gray-200 rounded-lg p-1.5 transition-all cursor-pointer"
                  >
                    🗑️ Remove
                  </button>
                )}
                
                <div className="text-xs font-extrabold text-gray-500">Variant #{idx + 1}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Flavor *</label>
                    <input
                      type="text"
                      required
                      value={v.flavor}
                      onChange={(e) => handleVariantChange(idx, 'flavor', e.target.value)}
                      placeholder="Chocolate"
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Size / Pack *</label>
                    <input
                      type="text"
                      required
                      value={v.size}
                      onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                      placeholder="1kg"
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">MRP *</label>
                    <input
                      type="number"
                      required
                      value={v.mrp}
                      onChange={(e) => handleVariantChange(idx, 'mrp', e.target.value)}
                      placeholder="Original Price"
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Selling Price *</label>
                    <input
                      type="number"
                      required
                      value={v.sellingPrice}
                      onChange={(e) => handleVariantChange(idx, 'sellingPrice', e.target.value)}
                      placeholder="Discount Price"
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Stock Available *</label>
                    <input
                      type="number"
                      required
                      value={v.stock}
                      onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                      placeholder="Stock"
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Low Stock Alert Level</label>
                    <input
                      type="number"
                      value={v.lowStockAlert}
                      onChange={(e) => handleVariantChange(idx, 'lowStockAlert', e.target.value)}
                      placeholder="5"
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">SKU (Optional)</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details & Policies */}
        <div className="space-y-4 border-t pt-5">
          <h4 className="text-sm font-bold text-gray-750">Policies & Flags</h4>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="isReturnable" checked={form.isReturnable} onChange={handleChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
              Easy Returns Available
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="deliveryAvailable" checked={form.deliveryAvailable} onChange={handleChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
              Delivery Available
            </label>
          </div>
        </div>

        {/* Media Images */}
        <div className="space-y-4 border-t pt-5">
          <h4 className="text-sm font-bold text-gray-750">Upload Images (Max 10 images)</h4>
          
          {/* Previews Grid */}
          {(existingImages.length > 0 || images.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Existing Images */}
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative group border rounded-xl overflow-hidden aspect-square bg-gray-50">
                  <img src={url} alt="existing" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeExistingImage(url)}
                      className="bg-red-650 text-white rounded-lg p-1.5 text-xs font-bold hover:bg-red-700 transition-colors">
                      🗑️ Remove
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-gray-900/60 text-white text-[8px] px-1.5 py-0.5 rounded font-semibold">Active</span>
                </div>
              ))}

              {/* New Images Previews */}
              {images.map((file, idx) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={`new-${idx}`} className="relative group border rounded-xl overflow-hidden aspect-square bg-gray-50">
                    <img src={url} alt="new-preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeNewImage(idx)}
                        className="bg-red-650 text-white rounded-lg p-1.5 text-xs font-bold hover:bg-red-700 transition-colors">
                        🗑️ Remove
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-red-600/80 text-white text-[8px] px-1.5 py-0.5 rounded font-semibold">New</span>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <input type="file" multiple accept="image/*" onChange={handleImageChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-750 hover:file:bg-red-100 cursor-pointer" />
            <p className="text-[10px] text-gray-400 mt-1">Upload at least 5 images representing the supplement product (Max 10 total).</p>
          </div>
        </div>

        {/* Submit Approval Switch */}
        {!isEdit && (
          <div className="flex items-center gap-2 border-t pt-5">
            <input type="checkbox" id="submitForApproval" name="submitForApproval" checked={form.submitForApproval} onChange={handleChange}
              className="w-4 h-4 text-red-650 border-gray-300 rounded focus:ring-red-500" />
            <label htmlFor="submitForApproval" className="text-sm font-semibold text-gray-700">Submit directly to City Admin for live listing approval</label>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-5 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/health-store-owner/supplements/list')}
            className="px-5 py-2.5 border rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-55 shadow-md">
            {loading ? 'Processing...' : (isEdit ? 'Save Changes' : (form.submitForApproval ? 'Submit Listing' : 'Save as Draft'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSupplement;
