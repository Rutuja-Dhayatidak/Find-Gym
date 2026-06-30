import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  getMobileAppBanners, 
  createMobileAppBanner, 
  updateMobileAppBanner, 
  deleteMobileAppBanner, 
  toggleMobileAppBannerStatus 
} from '../../../../services/adminApi';
import { resolveMediaUrl } from '../../../../services/config';

const MobileAppBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    smallTitle: 'LIVE FITNESS DEALS NEAR YOU',
    headline: 'FITNESS MADE AFFORDABLE',
    subtitle: 'Save up to 40% on gym memberships',
    discountText: 'UP TO 40% OFF',
    buttonText: 'Explore Deals',
    isActive: true,
    sortOrder: 0
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await getMobileAppBanners();
      if (res.success) {
        setBanners(res.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch mobile app banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        smallTitle: banner.smallTitle || '',
        headline: banner.headline || '',
        subtitle: banner.subtitle || '',
        discountText: banner.discountText || '',
        buttonText: banner.buttonText || '',
        isActive: banner.isActive,
        sortOrder: banner.sortOrder || 0
      });
      setImagePreview(resolveMediaUrl(banner.bannerImage));
      setSelectedFile(null);
    } else {
      setEditingBanner(null);
      setFormData({
        smallTitle: 'LIVE FITNESS DEALS NEAR YOU',
        headline: 'FITNESS MADE AFFORDABLE',
        subtitle: 'Save up to 40% on gym memberships',
        discountText: 'UP TO 40% OFF',
        buttonText: 'Explore Deals',
        isActive: true,
        sortOrder: 0
      });
      setImagePreview('');
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files are allowed: JPG, JPEG, PNG, WEBP');
        return;
      }
      
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size exceeds the 50MB limit');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const res = await toggleMobileAppBannerStatus(banner._id);
      if (res.success) {
        toast.success(res.message);
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const res = await deleteMobileAppBanner(id);
        if (res.success) {
          toast.success('Banner deleted successfully');
          fetchBanners();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete banner');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingBanner && !selectedFile) {
      toast.error('Banner image is required');
      return;
    }
    if (!formData.headline) {
      toast.error('Headline is required');
      return;
    }
    if (!formData.buttonText) {
      toast.error('Explore button text is required');
      return;
    }

    setSaving(true);
    const data = new FormData();
    data.append('smallTitle', formData.smallTitle);
    data.append('headline', formData.headline);
    data.append('subtitle', formData.subtitle);
    data.append('discountText', formData.discountText);
    data.append('buttonText', formData.buttonText);
    data.append('isActive', formData.isActive);
    data.append('sortOrder', formData.sortOrder);
    
    if (selectedFile) {
      data.append('bannerImage', selectedFile);
    }

    try {
      let res;
      if (editingBanner) {
        res = await updateMobileAppBanner(editingBanner._id, data);
      } else {
        res = await createMobileAppBanner(data);
      }

      if (res.success) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
        closeModal();
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Mobile App Banners</h1>
          <p className="text-sm text-slate-500 mt-1">Manage promotional banners for the mobile application home screen</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform active:scale-95"
        >
          <span>➕</span>
          <span>Add New Banner</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-slate-600 font-medium">Loading banners...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Headline</th>
                  <th className="px-6 py-4">Discount Badge</th>
                  <th className="px-6 py-4">Button Text</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <img 
                        src={resolveMediaUrl(banner.bannerImage)} 
                        alt={banner.headline} 
                        className="w-24 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">{banner.headline}</td>
                    <td className="px-6 py-4">
                      {banner.discountText ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                          {banner.discountText}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{banner.buttonText}</td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">{banner.sortOrder}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          banner.isActive ? 'bg-orange-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            banner.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-2 text-xs font-semibold ${banner.isActive ? 'text-green-600' : 'text-red-500'}`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3 text-sm font-semibold">
                        <button
                          onClick={() => openModal(banner)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {banners.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No mobile app banners found. Click "Add New Banner" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal containing Form and Live Mobile Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                {editingBanner ? 'Edit Mobile App Banner' : 'Add Mobile App Banner'}
              </h2>
              
              <div className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Banner Image * {editingBanner && <span className="text-xs font-normal text-slate-500">(Leave blank to keep existing)</span>}
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl hover:border-orange-500 transition-colors p-4 flex flex-col items-center justify-center bg-slate-50">
                    <input
                      type="file"
                      id="bannerImageInput"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center">
                      <span className="text-3xl">🖼️</span>
                      <p className="text-sm font-medium text-slate-700 mt-2">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG, WEBP up to 50MB</p>
                    </div>
                  </div>
                </div>

                {/* Small Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Small Title / Label</label>
                  <input
                    type="text"
                    value={formData.smallTitle}
                    onChange={(e) => setFormData({ ...formData, smallTitle: e.target.value })}
                    className="w-full px-3,5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="e.g. LIVE FITNESS DEALS NEAR YOU"
                  />
                </div>

                {/* Headline */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Headline *</label>
                  <input
                    type="text"
                    required
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="e.g. FITNESS MADE AFFORDABLE"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="e.g. Save up to 40% on gym memberships"
                  />
                </div>

                {/* Discount Text */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Discount Text Badge</label>
                  <input
                    type="text"
                    value={formData.discountText}
                    onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="e.g. UP TO 40% OFF"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Explore Button Text *</label>
                  <input
                    type="text"
                    required
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="e.g. Explore Deals"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      placeholder="0"
                    />
                  </div>

                  {/* Status Toggle */}
                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex items-center space-x-3 cursor-pointer py-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Set as Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-3 justify-end border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
                >
                  {saving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>

            {/* Mobile App Live Preview Section */}
            <div className="w-full md:w-96 bg-slate-950 p-6 md:p-8 flex flex-col justify-center items-center relative select-none">
              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 text-center">
                Live Mobile Screen Preview
              </div>
              
              {/* Smartphone Outer Container */}
              <div className="w-[300px] h-[520px] rounded-[40px] border-[12px] border-slate-800 bg-slate-900 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4">
                
                {/* Camera Notch */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20"></div>
                
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-2 pt-1 mb-6">
                  <span>9:41 AM</span>
                  <div className="flex items-center space-x-1.5">
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Banner Element (Dark Theme Card) */}
                <div className="w-full h-[280px] rounded-3xl overflow-hidden relative border border-slate-700 shadow-xl flex flex-col justify-end p-4 mb-16 bg-slate-800">
                  
                  {/* Background Image with Dark Overlay */}
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Banner background" 
                      className="absolute inset-0 w-full h-full object-cover z-0" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-0">
                      <span className="text-slate-500 text-xs font-semibold">No Image Uploaded</span>
                    </div>
                  )}
                  
                  {/* Dark Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20 z-10"></div>
                  
                  {/* Banner content */}
                  <div className="relative z-20 space-y-2 text-left">
                    {/* Small Label (Orange text) */}
                    {formData.smallTitle && (
                      <p className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest leading-tight">
                        {formData.smallTitle}
                      </p>
                    )}
                    
                    {/* Headline (White bold text) */}
                    {formData.headline && (
                      <h3 className="text-lg font-black text-white leading-tight uppercase">
                        {formData.headline}
                      </h3>
                    )}
                    
                    {/* Subtitle (Gray text) */}
                    {formData.subtitle && (
                      <p className="text-xs font-medium text-slate-300 leading-normal">
                        {formData.subtitle}
                      </p>
                    )}
                    
                    {/* Bottom Action Area */}
                    <div className="flex items-center justify-between pt-1">
                      {/* Explore Button (Green background) */}
                      {formData.buttonText && (
                        <span className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full hover:bg-emerald-400 transition-colors shadow-sm inline-block">
                          {formData.buttonText}
                        </span>
                      )}
                      
                      {/* Discount Badge (Green circle/pill badge) */}
                      {formData.discountText && (
                        <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm">
                          {formData.discountText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mb-1"></div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAppBanners;
