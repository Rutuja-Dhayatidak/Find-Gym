import React, { useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Video, Trash2, LayoutTemplate } from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import { uploadBanner, getAllBanners } from '../../../../services/superApi';
import axiosInstance from '../../../../services/axiosInstance';
import { resolveMediaUrl } from '../../../../services/config';

const CMSManagement = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await getAllBanners();
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('media', selectedFile);
    formData.append('title', title);

    try {
      const res = await uploadBanner(formData);
      alert('Upload successful');
      setSelectedFile(null);
      setTitle('');
      fetchBanners(); // Refresh the list
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/superadmin/cms/banners/${id}`);
      fetchBanners(); // Refresh the list
    } catch (error) {
      alert('Failed to delete banner: ' + error.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500">Manage app banners, static content, and media</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className="flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors bg-orange-50 text-primary border-b-2 border-primary"
          >
            <LayoutTemplate size={18} /> Home Page Banners
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload New Banner</h3>
              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Banner Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Media File * (Max 50MB)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg,image/png,video/mp4,video/webm" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 50MB</p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded flex justify-between items-center">
                      <span className="truncate">{selectedFile.name}</span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <Button type="submit" variant="primary" className="w-full" loading={uploading}>
                  Upload Banner
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Active & Previous Banners</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.length === 0 && !loadingBanners && (
                  <p className="text-gray-500 text-sm col-span-2">No banners uploaded yet.</p>
                )}
                {banners.map(banner => {
                  const isVideo = banner.mediaType?.startsWith('video/');
                  const fullUrl = resolveMediaUrl(banner.mediaUrl);

                  return (
                    <div key={banner._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                      <div className="h-32 bg-gray-200 relative">
                        {isVideo ? (
                          <video src={fullUrl} className="w-full h-full object-cover" muted loop autoPlay />
                        ) : (
                          <img src={fullUrl} alt={banner.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge label={banner.status || 'Active'} variant={banner.status === 'Active' ? 'success' : 'default'} />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          {!isVideo ? <ImageIcon size={12} /> : <Video size={12} />} {!isVideo ? 'Image' : 'Video'}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 truncate">{banner.title}</h4>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="secondary" size="sm" className="flex-1">Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(banner._id)}><Trash2 size={16} /></Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSManagement;
