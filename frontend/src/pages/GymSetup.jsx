import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGymById, setupGym, uploadGymImage } from '../userServices/gymApi';
import toast from 'react-hot-toast';
import {
  Dumbbell,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  MapPin,
  Clock,
  Sparkles,
  DollarSign,
  Users,
  Tag,
  Info,
  Calendar,
  CheckCircle,
  HelpCircle,
  Menu,
  ChevronRight
} from 'lucide-react';

const GymSetup = () => {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gymName, setGymName] = useState('');

  // Form states matching backend Schema
  const [basicInfo, setBasicInfo] = useState({
    about: '',
    openingTime: '06:00',
    closingTime: '22:00',
  });

  const [images, setImages] = useState({
    heroImage: '',
    galleryImages: []
  });

  const [locationAndFacilities, setLocationAndFacilities] = useState({
    latitude: '',
    longitude: '',
    facilities: []
  });

  const [trainers, setTrainers] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [offers, setOffers] = useState([]);
  const [freeTrial, setFreeTrial] = useState({
    available: false,
    days: 3,
    description: ''
  });

  // Predefined facilities/amenities options
  const facilityOptions = [
    'Cardio', 'Strength Training', 'Personal Trainer', 'Locker',
    'Shower', 'Steam', 'Diet Plan', 'Parking', 'Wi-Fi', 'AC',
    'Sauna', 'Swimming Pool', 'Yoga Studio', 'Crossfit Area'
  ];

  // Temp input states for array fields
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newTrainer, setNewTrainer] = useState({ name: '', photo: '', experience: '', specialization: '', bio: '', skills: '', instagramLink: '', certification: '', availability: '', trainingType: 'Weight Loss' });
  const [newPlan, setNewPlan] = useState({ title: '', price: '', duration: '', validity: '', saving: '', isPopular: false });
  const [newOffer, setNewOffer] = useState({ title: '', description: '', image: '', expiryDate: '', offerType: '' });

  useEffect(() => {
    if (!gymId) {
      toast.error('Gym ID is required');
      navigate('/gym-owner/dashboard');
      return;
    }

    const fetchGymData = async () => {
      try {
        setLoading(true);
        const res = await getGymById(gymId);
        const gym = res.data || res;

        setGymName(gym.name || 'Your Gym');
        setBasicInfo({
          about: gym.about || gym.description || '',
          openingTime: gym.openingTime || '06:00',
          closingTime: gym.closingTime || '22:00',
        });

        setImages({
          heroImage: gym.heroImage || '',
          galleryImages: gym.galleryImages || []
        });

        setLocationAndFacilities({
          latitude: gym.latitude || gym.location?.latitude || '',
          longitude: gym.longitude || gym.location?.longitude || '',
          facilities: gym.facilities && gym.facilities.length > 0 ? gym.facilities : (gym.amenities || [])
        });

        setTrainers(gym.trainers || []);
        setMembershipPlans(gym.membershipPlans || []);
        setOffers(gym.offers || []);
        setFreeTrial({
          available: gym.freeTrial?.available || false,
          days: gym.freeTrial?.days || 3,
          description: gym.freeTrial?.description || ''
        });

      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch gym details');
      } finally {
        setLoading(false);
      }
    };

    fetchGymData();
  }, [gymId, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        about: basicInfo.about,
        openingTime: basicInfo.openingTime,
        closingTime: basicInfo.closingTime,
        heroImage: images.heroImage,
        galleryImages: images.galleryImages,
        latitude: parseFloat(locationAndFacilities.latitude) || null,
        longitude: parseFloat(locationAndFacilities.longitude) || null,
        facilities: locationAndFacilities.facilities,
        trainers,
        membershipPlans,
        offers,
        freeTrial
      };

      const res = await setupGym(gymId, payload);
      toast.success('Gym setup updated successfully!');
      if (res.data) {
        setGymName(res.data.name || gymName);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingTrainerPhoto, setUploadingTrainerPhoto] = useState(false);
  const [uploadingOfferImage, setUploadingOfferImage] = useState(false);

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingHero(true);
    const loadingToast = toast.loading('Uploading hero image...');
    try {
      const res = await uploadGymImage(file);
      if (res.success && res.url) {
        setImages(prev => ({
          ...prev,
          heroImage: res.url
        }));
        toast.success('Hero image uploaded successfully!', { id: loadingToast });
      } else {
        toast.error('Failed to upload image', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed. Please try again.', { id: loadingToast });
    } finally {
      setUploadingHero(false);
    }
  };

  const handleGalleryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingGallery(true);
    const loadingToast = toast.loading('Uploading gallery image...');
    try {
      const res = await uploadGymImage(file);
      if (res.success && res.url) {
        setImages(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, res.url]
        }));
        toast.success('Gallery image uploaded successfully!', { id: loadingToast });
      } else {
        toast.error('Failed to upload image', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed. Please try again.', { id: loadingToast });
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleTrainerPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingTrainerPhoto(true);
    const loadingToast = toast.loading('Uploading trainer photo...');
    try {
      const res = await uploadGymImage(file);
      if (res.success && res.url) {
        setNewTrainer(prev => ({ ...prev, photo: res.url }));
        toast.success('Trainer photo uploaded!', { id: loadingToast });
      } else {
        toast.error('Upload failed', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload failed', { id: loadingToast });
    } finally {
      setUploadingTrainerPhoto(false);
    }
  };

  const handleOfferImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingOfferImage(true);
    const loadingToast = toast.loading('Uploading offer image...');
    try {
      const res = await uploadGymImage(file);
      if (res.success && res.url) {
        setNewOffer(prev => ({ ...prev, image: res.url }));
        toast.success('Offer image uploaded!', { id: loadingToast });
      } else {
        toast.error('Upload failed', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload failed', { id: loadingToast });
    } finally {
      setUploadingOfferImage(false);
    }
  };

  const addGalleryImage = () => {
    if (!newGalleryUrl) {
      toast.error('Please enter an image URL');
      return;
    }
    if (!newGalleryUrl.startsWith('http://') && !newGalleryUrl.startsWith('https://')) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    setImages(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, newGalleryUrl]
    }));
    setNewGalleryUrl('');
  };

  const removeGalleryImage = (index) => {
    setImages(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const toggleFacility = (facility) => {
    setLocationAndFacilities(prev => {
      const current = prev.facilities;
      const updated = current.includes(facility)
        ? current.filter(f => f !== facility)
        : [...current, facility];
      return { ...prev, facilities: updated };
    });
  };

  const addTrainer = () => {
    if (!newTrainer.name || !newTrainer.experience || !newTrainer.specialization) {
      toast.error('Trainer Name, Experience and Specialization are required');
      return;
    }
    const skillsArray = typeof newTrainer.skills === 'string'
      ? newTrainer.skills.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(newTrainer.skills) ? newTrainer.skills : []);

    setTrainers(prev => [...prev, { ...newTrainer, skills: skillsArray }]);
    setNewTrainer({ name: '', photo: '', experience: '', specialization: '', bio: '', skills: '', instagramLink: '', certification: '', availability: '', trainingType: 'Weight Loss' });
  };

  const removeTrainer = (index) => {
    setTrainers(prev => prev.filter((_, i) => i !== index));
  };

  const addPlan = () => {
    if (!newPlan.title || !newPlan.price || !newPlan.duration || !newPlan.validity) {
      toast.error('Plan Title, Price, Duration and Validity are required');
      return;
    }
    setMembershipPlans(prev => [...prev, {
      ...newPlan,
      price: parseFloat(newPlan.price),
      saving: parseFloat(newPlan.saving) || 0
    }]);
    setNewPlan({ title: '', price: '', duration: '', validity: '', saving: '', isPopular: false });
  };

  const removePlan = (index) => {
    setMembershipPlans(prev => prev.filter((_, i) => i !== index));
  };

  const addOffer = () => {
    if (!newOffer.title || !newOffer.description) {
      toast.error('Offer Title and Description are required');
      return;
    }
    setOffers(prev => [...prev, { ...newOffer }]);
    setNewOffer({ title: '', description: '', image: '', expiryDate: '', offerType: '' });
  };

  const removeOffer = (index) => {
    setOffers(prev => prev.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationAndFacilities(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success('Location coordinates loaded successfully');
        },
        (error) => {
          toast.error('Could not detect location. Please input manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-805 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-orange-500 border-slate-200 rounded-full animate-spin"></div>
          <p className="text-slate-550 font-semibold text-sm">Loading Setup Wizard...</p>
        </div>
      </div>
    );
  }

  const isPublishReady = basicInfo.about && images.heroImage && membershipPlans.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row relative">

      {/* Sidebar - Matches Dashboard Navigation Menu */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:min-h-screen shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
          <Dumbbell className="w-6 h-6 text-orange-500" />
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
            livesale.Fitness Owner
          </span>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 text-left">
          <button
            onClick={() => navigate('/gym-owner/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-350 hover:bg-slate-805 hover:text-white transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="pt-4 pb-2 px-4 text-[10.5px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-805/40 mt-4">
            Setup Console
          </div>

          {[
            { id: 'basic', label: 'About & Timings', icon: Clock },
            { id: 'images', label: 'Banner & Gallery', icon: ImageIcon },
            { id: 'facilities', label: 'Facilities & Location', icon: MapPin },
            { id: 'trainers', label: 'Our Trainers', icon: Users },
            { id: 'plans', label: 'Membership Plans', icon: DollarSign },
            { id: 'offers', label: 'Offers & Free Trial', icon: Tag },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-left ${isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight truncate max-w-[280px] md:max-w-none">
              {gymName} Setup Wizard
            </h2>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </header>

        {/* Content body */}
        <main className="flex-grow p-6 md:p-8 space-y-6 overflow-y-auto max-w-6xl w-full mx-auto text-left">

          {/* Setup Progress Information Banner */}
          <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-orange-800 shadow-sm">
            <div className="flex items-start gap-3 text-left">
              <Info className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Gym Setup Requirements</h4>
                <p className="text-xs text-slate-650 mt-1 leading-relaxed max-w-2xl">
                  Provide an About description, hero image, and at least one membership plan to make this gym live. Once configured, status marks as <span className="text-orange-600 font-bold">Setup Completed</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center shrink-0">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full mt-1 border ${isPublishReady
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${isPublishReady ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {isPublishReady ? 'Setup Completed' : 'Setup Incomplete'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Wizard Card Container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">

            {/* Tab: About & Timings */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span>About & Operating Hours</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Configure background description and default hours of operation</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">About Gym (Detailed Description)</label>
                    <textarea
                      value={basicInfo.about}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, about: e.target.value }))}
                      placeholder="Describe your gym, programs, equipment, certified trainers, and details about your services..."
                      rows={8}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Opening Time</label>
                      <input
                        type="time"
                        value={basicInfo.openingTime}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, openingTime: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Closing Time</label>
                      <input
                        type="time"
                        value={basicInfo.closingTime}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, closingTime: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Banner & Gallery */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-orange-500" />
                    <span>Hero Banner & Gallery Images</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Upload images directly to Cloudinary or specify image URLs</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Hero Banner Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Option 1: Upload directly</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          disabled={uploadingHero}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 bg-white border border-slate-200 rounded-xl p-2"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Option 2: Paste Image URL</span>
                        <input
                          type="url"
                          value={images.heroImage}
                          onChange={(e) => setImages(prev => ({ ...prev, heroImage: e.target.value }))}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-slate-800"
                        />
                      </div>
                    </div>
                    {images.heroImage && (
                      <div className="mt-3 aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                        <img src={images.heroImage} alt="Hero Banner Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/600x400/eceff1/78909c?text=Invalid+Image+URL" }} />
                        <span className="absolute bottom-2.5 right-2.5 bg-black/60 px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-extrabold text-white">Preview</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Add Gallery Images</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Option 1: Upload directly</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGalleryImageUpload}
                          disabled={uploadingGallery}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 bg-white border border-slate-200 rounded-xl p-2"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Option 2: Paste Image URL</span>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newGalleryUrl}
                            onChange={(e) => setNewGalleryUrl(e.target.value)}
                            placeholder="Paste image URL here..."
                            className="flex-grow px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={addGalleryImage}
                            className="px-5 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                      {images.galleryImages.map((img, i) => (
                        <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 relative group bg-slate-100 shadow-sm">
                          <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-all font-bold cursor-pointer"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Facilities & Location */}
            {activeTab === 'facilities' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span>Amenities & Coordinates</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Select key amenities and set location coordinates for public maps</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3.5">Select Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {facilityOptions.map(facility => {
                        const isSelected = locationAndFacilities.facilities.includes(facility);
                        return (
                          <label
                            key={facility}
                            onClick={() => toggleFacility(facility)}
                            className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer select-none text-xs font-bold transition-all uppercase tracking-wider ${isSelected
                                ? 'bg-orange-50 border-orange-500 text-orange-700 font-extrabold shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                          >
                            {facility}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Map Coordinates</span>
                      <button
                        type="button"
                        onClick={detectLocation}
                        className="px-3 py-1.5 bg-orange-50 border border-orange-200 hover:bg-orange-500 hover:text-white text-orange-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Detect coordinates
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={locationAndFacilities.latitude}
                          onChange={(e) => setLocationAndFacilities(prev => ({ ...prev, latitude: e.target.value }))}
                          placeholder="e.g. 18.5204"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={locationAndFacilities.longitude}
                          onChange={(e) => setLocationAndFacilities(prev => ({ ...prev, longitude: e.target.value }))}
                          placeholder="e.g. 73.8567"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-slate-800"
                        />
                      </div>
                    </div>

                    {locationAndFacilities.latitude && locationAndFacilities.longitude && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 h-44 mt-3">
                        <iframe
                          src={`https://maps.google.com/maps?q=${locationAndFacilities.latitude},${locationAndFacilities.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          className="w-full h-full border-0 filter brightness-[96%] contrast-[102%]"
                          title="Coordinate Preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Our Trainers */}
            {activeTab === 'trainers' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span>Gym Trainers List</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Manage physical trainers assigned to this location</p>
                </div>

                <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Add New Trainer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trainer Name</label>
                      <input
                        type="text"
                        value={newTrainer.name}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Rohit Sharma"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trainer Photo</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTrainerPhotoUpload}
                          disabled={uploadingTrainerPhoto}
                          className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 bg-white border border-slate-200 rounded-xl p-1"
                        />
                        <input
                          type="url"
                          value={newTrainer.photo}
                          onChange={(e) => setNewTrainer(prev => ({ ...prev, photo: e.target.value }))}
                          placeholder="Or paste URL..."
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Experience (e.g. 5+ Years Exp.)</label>
                      <input
                        type="text"
                        value={newTrainer.experience}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="e.g. 5+ Years Exp."
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Specialization</label>
                      <input
                        type="text"
                        value={newTrainer.specialization}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="e.g. Strength & Conditioning"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trainer Bio / Short Description</label>
                      <textarea
                        value={newTrainer.bio}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell members about this trainer..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Skills / Tags (comma separated)</label>
                      <input
                        type="text"
                        value={newTrainer.skills}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder="e.g. Strength, Weight Loss, Diet, Cardio"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Instagram / Profile Link</label>
                      <input
                        type="text"
                        value={newTrainer.instagramLink}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, instagramLink: e.target.value }))}
                        placeholder="e.g. https://instagram.com/trainer"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Certification Name</label>
                      <input
                        type="text"
                        value={newTrainer.certification}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, certification: e.target.value }))}
                        placeholder="e.g. Gold's Gym Certified, ACSM"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Availability / Timing</label>
                      <input
                        type="text"
                        value={newTrainer.availability}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, availability: e.target.value }))}
                        placeholder="e.g. 6:00 AM - 12:00 PM, 4:00 PM - 8:00 PM"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Training Type</label>
                      <select
                        value={newTrainer.trainingType}
                        onChange={(e) => setNewTrainer(prev => ({ ...prev, trainingType: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      >
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Bodybuilding">Bodybuilding</option>
                        <option value="CrossFit">CrossFit</option>
                        <option value="Yoga">Yoga</option>
                        <option value="Functional Training">Functional Training</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addTrainer}
                    className="w-full mt-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Trainer to List
                  </button>
                </div>

                <div className="space-y-3.5 mt-5">
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Current Trainers ({trainers.length})</h4>
                  {trainers.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No trainers registered yet. Add at least one to display on details page.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trainers.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                              <img src={t.photo || "https://placehold.co/100"} alt={t.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                              <h5 className="font-bold text-sm text-slate-800">{t.name}</h5>
                              <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{t.experience} • {t.specialization}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTrainer(idx)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Membership Plans */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    <span>Membership Plans Configuration</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Configure comparative pricing structures for subscription cards</p>
                </div>

                <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Add New Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Plan Title</label>
                      <input
                        type="text"
                        value={newPlan.title}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Monthly / Yearly"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                      <input
                        type="number"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g. 1500"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Duration Description</label>
                      <input
                        type="text"
                        value={newPlan.duration}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g. month / 3 Months"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Validity Text</label>
                      <input
                        type="text"
                        value={newPlan.validity}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, validity: e.target.value }))}
                        placeholder="e.g. Valid for 30 Days"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Saving Text (₹ or %)</label>
                      <input
                        type="number"
                        value={newPlan.saving}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, saving: e.target.value }))}
                        placeholder="e.g. 300"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-500 select-none">
                        <input
                          type="checkbox"
                          checked={newPlan.isPopular}
                          onChange={(e) => setNewPlan(prev => ({ ...prev, isPopular: e.target.checked }))}
                          className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-4 h-4 bg-white"
                        />
                        Highlight Best Value
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addPlan}
                    className="w-full mt-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Plan to List
                  </button>
                </div>

                <div className="space-y-3.5 mt-5">
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Registered Plans ({membershipPlans.length})</h4>
                  {membershipPlans.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No plans registered. Please add at least one plan to complete setup requirements.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {membershipPlans.map((p, idx) => (
                        <div key={idx} className={`relative bg-slate-50 p-5 rounded-xl border flex flex-col justify-between ${p.isPopular ? 'border-orange-500 bg-orange-50/20' : 'border-slate-200'}`}>
                          {p.isPopular && (
                            <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[8.5px] bg-orange-500 text-white rounded font-extrabold uppercase">Popular</span>
                          )}
                          <div className="text-left">
                            <h5 className="font-bold text-sm text-slate-800 uppercase">{p.title}</h5>
                            <p className="text-xl font-extrabold text-orange-500 mt-2">₹{p.price.toLocaleString()} <span className="text-[10px] text-slate-450">/{p.duration}</span></p>
                            <p className="text-[10px] text-slate-500 mt-1">{p.validity}</p>
                            {p.saving > 0 && (
                              <p className="text-[10px] text-green-600 font-bold mt-1">Save ₹{p.saving.toLocaleString()}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePlan(idx)}
                            className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Offers & Trial */}
            {activeTab === 'offers' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-orange-500" />
                    <span>Offers & Free Trial passes</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Configure promotional discount codes and free trial pass settings</p>
                </div>

                {/* Free Trial Toggle */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase">Free Trial Pass</h4>
                      <p className="text-slate-450 text-[10px] mt-0.5">Toggle free guest trial sessions for new customer visits</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={freeTrial.available}
                        onChange={(e) => setFreeTrial(prev => ({ ...prev, available: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {freeTrial.available && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-1.5 duration-200">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Free Trial Days</label>
                        <input
                          type="number"
                          value={freeTrial.days}
                          onChange={(e) => setFreeTrial(prev => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                        <input
                          type="text"
                          value={freeTrial.description}
                          onChange={(e) => setFreeTrial(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="e.g. Experience our premium facilities"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Promotional Offers */}
                <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Add Promo Offer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Offer Title</label>
                      <input
                        type="text"
                        value={newOffer.title}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. 50% OFF on First Month"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description / Details</label>
                      <input
                        type="text"
                        value={newOffer.description}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g. Hurry Up! Offer valid till 31 May 2026"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Offer Image</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleOfferImageUpload}
                          disabled={uploadingOfferImage}
                          className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 bg-white border border-slate-200 rounded-xl p-1"
                        />
                        <input
                          type="url"
                          value={newOffer.image}
                          onChange={(e) => setNewOffer(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="Or paste URL..."
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Offer Type</label>
                      <input
                        type="text"
                        value={newOffer.offerType}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, offerType: e.target.value }))}
                        placeholder="e.g. Percentage / Flat Discount"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addOffer}
                    className="w-full mt-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Offer to List
                  </button>
                </div>

                <div className="space-y-3.5 mt-5">
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Current Offers ({offers.length})</h4>
                  {offers.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No promo offers registered.</p>
                  ) : (
                    <div className="space-y-3">
                      {offers.map((o, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 justify-between">
                          <div className="text-left flex-grow">
                            <span className="px-2 py-0.5 text-[8.5px] bg-orange-500 rounded font-bold uppercase text-white">Promo Offer</span>
                            <h5 className="font-bold text-sm text-slate-800 mt-1.5">{o.title}</h5>
                            <p className="text-xs text-slate-550 mt-1">{o.description}</p>
                            {o.offerType && (
                              <p className="text-[10px] text-slate-500 mt-0.5">Type: {o.offerType}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOffer(idx)}
                            className="p-2 hover:bg-red-50 text-slate-450 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save current changes'}
              </button>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default GymSetup;
