import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addProduct, getProductById, updateProduct } from '../../../../services/healthStoreOwnerApi';

const CATEGORIES = [
  'Weight Loss',
  'Muscle Gain',
  'High Protein',
  'Fat Loss',
  'Maintenance',
  'Diabetic Friendly',
  'Keto',
  'Balanced Diet'
];

const FOOD_TYPES = ['Veg', 'Non-Veg', 'Egg', 'Vegan'];
const ORDER_TYPES = ['Single Meal', 'Full Day Meal', 'Weekly Meal Plan', 'Monthly Subscription', 'Combo Meal'];
const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Evening Snack', 'Pre Workout', 'Post Workout'];
const SERVING_SIZES = ['1 Person', '2 Person'];
const PORTION_SIZES = ['250g', '500g', '1kg', 'Custom'];
const PROTEIN_OPTIONS = ['Paneer', 'Egg', 'Chicken', 'Soya', 'Tofu', 'None'];
const CARB_OPTIONS = ['Rice', 'Brown Rice', 'Roti', 'No Carb'];
const SPICE_LEVELS = ['Low', 'Medium', 'High'];
const OIL_PREFERENCES = ['Low Oil', 'Normal', 'Oil Free'];
const CONTAINS_OPTIONS = ['Dairy', 'Nuts', 'Gluten', 'Egg', 'Soy'];
const DELIVERY_RADII = ['5 km', '10 km', '15 km', 'Custom'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddDietFood = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    category: 'Weight Loss',
    foodPreference: 'Veg',
    orderType: 'Single Meal',
    shortDescription: '',
    description: '',
    benefits: '',
    suitableFor: '',

    // Meal Details
    mealTime: 'Breakfast',
    servingSize: '1 Person',
    portionSize: '250g',
    portionSizeCustom: '',
    preparationTime: '',

    // Customization
    proteinOption: 'None',
    carbOption: 'No Carb',
    spiceLevel: 'Medium',
    oilPreference: 'Normal',
    sugarFree: false,

    // Ingredients & Allergy
    ingredients: '',
    allergyWarning: '',
    contains: [],

    // Nutrition
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',

    // Pricing
    singleMealPrice: '',
    weeklyPlanPrice: '',
    monthlyPlanPrice: '',
    discountSellingPrice: '',
    subscriptionAvailable: false,

    // Availability & Delivery
    availableDays: [],
    availableTimeStart: '',
    availableTimeEnd: '',
    deliveryAvailable: false,
    deliveryRadius: '5 km',
    deliveryRadiusCustom: '',
    deliveryCharges: '',
    freeDeliveryAbove: '',
    maxOrdersPerDay: '',
    stockStatus: 'Available'
  });

  // Images state
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
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
            category: p.category || 'Weight Loss',
            foodPreference: p.foodPreference || 'Veg',
            orderType: p.orderType || 'Single Meal',
            shortDescription: p.shortDescription || '',
            description: p.description || '',
            benefits: p.benefits?.join('\n') || '',
            suitableFor: p.suitableFor?.join('\n') || '',

            mealTime: p.mealTime || 'Breakfast',
            servingSize: p.servingSize || '1 Person',
            portionSize: PORTION_SIZES.includes(p.portionSize) ? p.portionSize : 'Custom',
            portionSizeCustom: PORTION_SIZES.includes(p.portionSize) ? '' : (p.portionSize || ''),
            preparationTime: p.preparationTime || '',

            proteinOption: p.customizationOptions?.protein || 'None',
            carbOption: p.customizationOptions?.carb || 'No Carb',
            spiceLevel: p.customizationOptions?.spiceLevel || 'Medium',
            oilPreference: p.customizationOptions?.oilPreference || 'Normal',
            sugarFree: p.customizationOptions?.sugarFree || false,

            ingredients: p.ingredientsAllergyInfo?.ingredients || '',
            allergyWarning: p.ingredientsAllergyInfo?.allergyWarning || '',
            contains: p.ingredientsAllergyInfo?.contains || [],

            calories: p.nutritionInfo?.calories || '',
            protein: p.nutritionInfo?.protein || '',
            carbs: p.nutritionInfo?.carbs || '',
            fat: p.nutritionInfo?.fat || '',
            fiber: p.nutritionInfo?.fiber || '',

            singleMealPrice: p.pricing?.singleMealPrice || '',
            weeklyPlanPrice: p.pricing?.weeklyPlanPrice || '',
            monthlyPlanPrice: p.pricing?.monthlyPlanPrice || '',
            discountSellingPrice: p.pricing?.discountSellingPrice || '',
            subscriptionAvailable: p.pricing?.subscriptionAvailable || false,

            availableDays: p.availabilityDelivery?.availableDays || [],
            availableTimeStart: p.availabilityDelivery?.availableTimeStart || '',
            availableTimeEnd: p.availabilityDelivery?.availableTimeEnd || '',
            deliveryAvailable: p.availabilityDelivery?.deliveryAvailable || false,
            deliveryRadius: DELIVERY_RADII.includes(p.availabilityDelivery?.deliveryRadius) ? p.availabilityDelivery?.deliveryRadius : 'Custom',
            deliveryRadiusCustom: DELIVERY_RADII.includes(p.availabilityDelivery?.deliveryRadius) ? '' : (p.availabilityDelivery?.deliveryRadius || ''),
            deliveryCharges: p.availabilityDelivery?.deliveryCharges || '',
            freeDeliveryAbove: p.availabilityDelivery?.freeDeliveryAbove || '',
            maxOrdersPerDay: p.availabilityDelivery?.maxOrdersPerDay || '',
            stockStatus: p.availabilityDelivery?.stockStatus || 'Available'
          });

          if (p.images && p.images.length > 0) {
            setExistingImages(p.images);
          }
        } catch (err) {
          toast.error('Failed to load product details');
          navigate('/health-store-owner/diet-foods/list');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckboxListChange = (fieldName, option, isChecked) => {
    setForm(p => {
      const currentList = p[fieldName] || [];
      const updatedList = isChecked 
        ? [...currentList, option]
        : currentList.filter(item => item !== option);
      return { ...p, [fieldName]: updatedList };
    });
  };

  // Image helpers
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image size must be under 5MB");
      return;
    }
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newPreviews = [];

    if (galleryImages.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 gallery images.");
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setGalleryImages(p => [...p, ...validFiles]);
    setGalleryPreviews(p => [...p, ...newPreviews]);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(p => p.filter((_, i) => i !== index));
    setGalleryPreviews(p => p.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgUrl) => {
    setExistingImages(p => p.filter(url => url !== imgUrl));
  };

  const performSubmit = async (status) => {
    // Required Validation logic
    if (!form.name.trim()) return toast.error("Meal/Food name is required");
    if (!form.category) return toast.error("Fitness Goal Category is required");
    if (!form.foodPreference) return toast.error("Food Type is required");
    if (!form.orderType) return toast.error("Order Type is required");
    if (!form.mealTime) return toast.error("Meal Time is required");

    if (status === 'Pending Approval') {
      if (!isEdit && !coverImage) return toast.error("Cover Image is required for approval");
      if (form.availableDays.length === 0) return toast.error("Please select at least one Available Day");
      if (form.deliveryAvailable === undefined) return toast.error("Delivery Available option is required");

      const hasPrice = form.singleMealPrice || form.weeklyPlanPrice || form.monthlyPlanPrice;
      if (!hasPrice) return toast.error("Please enter at least one single meal or subscription plan price");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('productType', 'Diet');
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('foodPreference', form.foodPreference);
    formData.append('orderType', form.orderType);
    formData.append('shortDescription', form.shortDescription);
    formData.append('description', form.description);
    formData.append('benefits', form.benefits);
    formData.append('suitableFor', form.suitableFor);

    // Meal details
    formData.append('mealTime', form.mealTime);
    formData.append('servingSize', form.servingSize);
    const finalPortionSize = form.portionSize === 'Custom' ? form.portionSizeCustom : form.portionSize;
    formData.append('portionSize', finalPortionSize);
    formData.append('preparationTime', form.preparationTime);

    // Customization Options
    formData.append('customizationOptions', JSON.stringify({
      protein: form.proteinOption,
      carb: form.carbOption,
      spiceLevel: form.spiceLevel,
      oilPreference: form.oilPreference,
      sugarFree: form.sugarFree
    }));

    // Ingredients & Allergy
    formData.append('ingredientsAllergyInfo', JSON.stringify({
      ingredients: form.ingredients,
      allergyWarning: form.allergyWarning,
      contains: form.contains
    }));

    // Nutrition values mapping
    formData.append('calories', form.calories);
    formData.append('protein', form.protein);
    formData.append('carbs', form.carbs);
    formData.append('fat', form.fat);
    formData.append('fiber', form.fiber);

    // Pricing
    formData.append('pricing', JSON.stringify({
      singleMealPrice: form.singleMealPrice ? parseFloat(form.singleMealPrice) : null,
      weeklyPlanPrice: form.weeklyPlanPrice ? parseFloat(form.weeklyPlanPrice) : null,
      monthlyPlanPrice: form.monthlyPlanPrice ? parseFloat(form.monthlyPlanPrice) : null,
      discountSellingPrice: form.discountSellingPrice ? parseFloat(form.discountSellingPrice) : null,
      subscriptionAvailable: form.subscriptionAvailable
    }));

    // Legacy fallback mapping
    formData.append('originalPrice', form.singleMealPrice || form.monthlyPlanPrice || 0);
    formData.append('sellingPrice', form.discountSellingPrice || form.singleMealPrice || form.monthlyPlanPrice || 0);
    formData.append('monthlyPrice', form.monthlyPlanPrice || 0);

    // Availability & Delivery
    const finalRadius = form.deliveryRadius === 'Custom' ? form.deliveryRadiusCustom : form.deliveryRadius;
    formData.append('availabilityDelivery', JSON.stringify({
      availableDays: form.availableDays,
      availableTimeStart: form.availableTimeStart,
      availableTimeEnd: form.availableTimeEnd,
      deliveryAvailable: form.deliveryAvailable,
      deliveryRadius: finalRadius,
      deliveryCharges: form.deliveryCharges ? parseFloat(form.deliveryCharges) : 0,
      freeDeliveryAbove: form.freeDeliveryAbove ? parseFloat(form.freeDeliveryAbove) : null,
      maxOrdersPerDay: form.maxOrdersPerDay ? parseInt(form.maxOrdersPerDay) : null,
      stockStatus: form.stockStatus
    }));

    formData.append('submitForApproval', status === 'Pending Approval' ? 'true' : 'false');
    
    // Upload files handling
    if (coverImage) {
      formData.append('images', coverImage);
    }
    galleryImages.forEach(img => {
      formData.append('images', img);
    });

    if (isEdit) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    try {
      if (isEdit) {
        await updateProduct(id, formData);
        toast.success('Food Listing updated successfully!');
      } else {
        await addProduct(formData);
        toast.success(status === 'Pending Approval' ? 'Food Listing submitted for approval!' : 'Food Listing saved as Draft!');
      }
      navigate('/health-store-owner/diet-foods/list');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF7A00] border-t-transparent rounded-full mb-3" />
        <p className="text-gray-500 text-sm font-semibold">Fetching meal info...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/health-store-owner/diet-foods/list')} className="px-4 py-2 hover:bg-gray-150 rounded-xl transition-all border border-gray-300 font-bold text-sm bg-white cursor-pointer shadow-sm">
          🔙 Back
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Add Healthy Meal / Food Listing</h2>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">Create gym-friendly meals that users can order based on their fitness goals.</p>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="bg-white border rounded-3xl p-6 md:p-8 shadow-md space-y-8">
        
        {/* SECTION 1: Basic Food Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">🥗</span>
            <h3 className="text-base font-black text-gray-800">1. Basic Food Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Meal/Food Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Keto Grilled Chicken Bowl"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fitness Goal Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Food Type *</label>
              <select name="foodPreference" value={form.foodPreference} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {FOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Order Type *</label>
              <select name="orderType" value={form.orderType} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {ORDER_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Short Summary *</label>
              <input name="shortDescription" value={form.shortDescription} onChange={handleChange} required placeholder="A brief one-liner summary describing the meal"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Detailed Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the healthy ingredients, preparation style, recommended consumption time..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Key Benefits (One per line)</label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={2} placeholder="Lean protein source&#10;Low glycemic index carbs&#10;Keeps you full for hours"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Meal Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">⏰</span>
            <h3 className="text-base font-black text-gray-800">2. Meal Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Meal Time *</label>
              <select name="mealTime" value={form.mealTime} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {MEAL_TIMES.map(mt => <option key={mt} value={mt}>{mt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Serving Size</label>
              <select name="servingSize" value={form.servingSize} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {SERVING_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Portion Size</label>
              <div className="flex gap-2">
                <select name="portionSize" value={form.portionSize} onChange={handleChange}
                  className="w-1/2 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                  {PORTION_SIZES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {form.portionSize === 'Custom' && (
                  <input name="portionSizeCustom" value={form.portionSizeCustom} onChange={handleChange} placeholder="e.g. 350g"
                    className="w-1/2 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Preparation Time</label>
              <input name="preparationTime" value={form.preparationTime} onChange={handleChange} placeholder="e.g. 30 minutes"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>
          </div>
        </div>

        {/* SECTION 3: Food Customization Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">⚙️</span>
            <h3 className="text-base font-black text-gray-800">3. Food Customization Options</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Protein Option</label>
              <select name="proteinOption" value={form.proteinOption} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {PROTEIN_OPTIONS.map(po => <option key={po} value={po}>{po}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Carb Option</label>
              <select name="carbOption" value={form.carbOption} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {CARB_OPTIONS.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Spice Level</label>
              <select name="spiceLevel" value={form.spiceLevel} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {SPICE_LEVELS.map(sl => <option key={sl} value={sl}>{sl}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Oil Preference</label>
              <select name="oilPreference" value={form.oilPreference} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                {OIL_PREFERENCES.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 md:col-span-2 py-2">
              <input type="checkbox" id="sugarFree" name="sugarFree" checked={form.sugarFree} onChange={handleChange}
                className="w-5 h-5 text-[#FF7A00] border-gray-300 rounded focus:ring-[#FF7A00] cursor-pointer" />
              <label htmlFor="sugarFree" className="text-sm font-bold text-gray-700 cursor-pointer">Sugar Free Meal</label>
            </div>
          </div>
        </div>

        {/* SECTION 4: Ingredients & Allergy Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">🌾</span>
            <h3 className="text-base font-black text-gray-800">4. Ingredients & Allergy Info</h3>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ingredients</label>
              <textarea name="ingredients" value={form.ingredients} onChange={handleChange} rows={2} placeholder="List out active ingredients: Whole oats, Greek yogurt, Chia seeds..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Allergy Warning</label>
              <textarea name="allergyWarning" value={form.allergyWarning} onChange={handleChange} rows={2} placeholder="e.g. Prepared in facility that handles dairy and soy..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contains Allergens Checkboxes</label>
              <div className="flex flex-wrap gap-4">
                {CONTAINS_OPTIONS.map(allergen => (
                  <label key={allergen} className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer select-none">
                    <input type="checkbox" checked={form.contains.includes(allergen)}
                      onChange={(e) => handleCheckboxListChange('contains', allergen, e.target.checked)}
                      className="w-4 h-4 accent-[#FF7A00] rounded" />
                    {allergen}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Nutrition Per Serving */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">🔬</span>
            <h3 className="text-base font-black text-gray-800">5. Nutrition Per Serving</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Calories (kcal)</label>
              <input type="number" name="calories" value={form.calories} onChange={handleChange} placeholder="e.g. 450"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Protein (g)</label>
              <input name="protein" value={form.protein} onChange={handleChange} placeholder="e.g. 35g"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Carbs (g)</label>
              <input name="carbs" value={form.carbs} onChange={handleChange} placeholder="e.g. 42g"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fat (g)</label>
              <input name="fat" value={form.fat} onChange={handleChange} placeholder="e.g. 10g"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fiber (g)</label>
              <input name="fiber" value={form.fiber} onChange={handleChange} placeholder="e.g. 8g"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>
          </div>
        </div>

        {/* SECTION 6: Pricing & Subscription */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">💰</span>
            <h3 className="text-base font-black text-gray-800">6. Pricing & Subscription</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Single Meal Price (₹)</label>
              <input type="number" name="singleMealPrice" value={form.singleMealPrice} onChange={handleChange} placeholder="e.g. 180"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Discount Selling Price (₹)</label>
              <input type="number" name="discountSellingPrice" value={form.discountSellingPrice} onChange={handleChange} placeholder="e.g. 150"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div className="md:col-span-2 py-1.5 border-t border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Is subscription pricing available for this meal?</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 cursor-pointer">
                  <input type="radio" name="subscriptionAvailable" value="true" checked={form.subscriptionAvailable === true || form.subscriptionAvailable === 'true'}
                    onChange={() => setForm(p => ({ ...p, subscriptionAvailable: true }))} />
                  Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 cursor-pointer">
                  <input type="radio" name="subscriptionAvailable" value="false" checked={form.subscriptionAvailable === false || form.subscriptionAvailable === 'false'}
                    onChange={() => setForm(p => ({ ...p, subscriptionAvailable: false }))} />
                  No
                </label>
              </div>
            </div>

            {(form.subscriptionAvailable === true || form.subscriptionAvailable === 'true') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Weekly Plan Price (₹)</label>
                  <input type="number" name="weeklyPlanPrice" value={form.weeklyPlanPrice} onChange={handleChange} placeholder="e.g. 999"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Monthly Subscription Price (₹)</label>
                  <input type="number" name="monthlyPlanPrice" value={form.monthlyPlanPrice} onChange={handleChange} placeholder="e.g. 3499"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 7: Availability & Delivery */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">🛵</span>
            <h3 className="text-base font-black text-gray-800">7. Availability & Delivery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Available Days *</label>
              <div className="flex flex-wrap gap-3">
                {DAYS_OF_WEEK.map(day => (
                  <label key={day} className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer select-none bg-gray-50 border px-3 py-1.5 rounded-xl hover:bg-gray-100">
                    <input type="checkbox" checked={form.availableDays.includes(day)}
                      onChange={(e) => handleCheckboxListChange('availableDays', day, e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#FF7A00] rounded" />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service Start Time</label>
              <input type="time" name="availableTimeStart" value={form.availableTimeStart} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service End Time</label>
              <input type="time" name="availableTimeEnd" value={form.availableTimeEnd} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div className="md:col-span-2 py-1.5 border-t border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Delivery Available? *</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 cursor-pointer">
                  <input type="radio" name="deliveryAvailable" value="true" checked={form.deliveryAvailable === true || form.deliveryAvailable === 'true'}
                    onChange={() => setForm(p => ({ ...p, deliveryAvailable: true }))} />
                  Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 cursor-pointer">
                  <input type="radio" name="deliveryAvailable" value="false" checked={form.deliveryAvailable === false || form.deliveryAvailable === 'false'}
                    onChange={() => setForm(p => ({ ...p, deliveryAvailable: false }))} />
                  No
                </label>
              </div>
            </div>

            {(form.deliveryAvailable === true || form.deliveryAvailable === 'true') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Radius</label>
                  <div className="flex gap-2">
                    <select name="deliveryRadius" value={form.deliveryRadius} onChange={handleChange}
                      className="w-1/2 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                      {DELIVERY_RADII.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {form.deliveryRadius === 'Custom' && (
                      <input name="deliveryRadiusCustom" value={form.deliveryRadiusCustom} onChange={handleChange} placeholder="e.g. 20 km"
                        className="w-1/2 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Charges (₹)</label>
                  <input type="number" name="deliveryCharges" value={form.deliveryCharges} onChange={handleChange} placeholder="e.g. 30"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Free Delivery Above (₹)</label>
                  <input type="number" name="freeDeliveryAbove" value={form.freeDeliveryAbove} onChange={handleChange} placeholder="e.g. 500"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max Orders Per Day</label>
              <input type="number" name="maxOrdersPerDay" value={form.maxOrdersPerDay} onChange={handleChange} placeholder="e.g. 50"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock Status</label>
              <select name="stockStatus" value={form.stockStatus} onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-white">
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 8: Images & Submit */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="text-lg">🖼️</span>
            <h3 className="text-base font-black text-gray-800">8. Meal Images</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cover Image Upload */}
            <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 flex flex-col items-center justify-center relative min-h-[160px]">
              {coverPreview ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={removeCoverImage} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 transition-colors cursor-pointer shadow-md">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-3xl text-gray-400 block mb-2">📸</span>
                  <span className="text-xs font-bold text-gray-700 block mb-1">Cover Image *</span>
                  <label className="inline-block bg-[#FF7A00] hover:bg-orange-600 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-md">
                    Choose Cover Image
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2">Required for Approval. Max 5MB file.</p>
                </div>
              )}
            </div>

            {/* Gallery Images Upload */}
            <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 flex flex-col items-center justify-center relative min-h-[160px]">
              <div className="text-center w-full">
                <span className="text-3xl text-gray-400 block mb-2">🎞️</span>
                <span className="text-xs font-bold text-gray-700 block mb-1">Gallery Images (Max 5)</span>
                <label className="inline-block bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-md">
                  Add Gallery Images
                  <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="hidden" />
                </label>
                <p className="text-[10px] text-gray-400 mt-2">Upload up to 5 additional images of the dishes.</p>
              </div>
            </div>

            {/* Gallery Preview list */}
            {galleryPreviews.length > 0 && (
              <div className="md:col-span-2 space-y-2">
                <p className="text-xs font-bold text-gray-600">New Gallery Images Previews:</p>
                <div className="flex flex-wrap gap-3">
                  {galleryPreviews.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                      <img src={url} alt="Gallery Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] cursor-pointer">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Images (for edit mode) */}
            {isEdit && existingImages.length > 0 && (
              <div className="md:col-span-2 space-y-2 border-t pt-4">
                <p className="text-xs font-bold text-gray-600">Existing Uploaded Images:</p>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border">
                      <img src={url} alt="Existing product" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer shadow-md">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Button Row */}
        <div className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-3.5">
          <button type="button" onClick={() => navigate('/health-store-owner/diet-foods/list')}
            className="px-5 py-3 border rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer">
            Cancel
          </button>
          
          <button type="button" onClick={() => performSubmit('Draft')} disabled={loading}
            className="border-2 border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00]/5 font-bold text-sm px-6 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm">
            {loading ? 'Processing...' : 'Save as Draft'}
          </button>

          <button type="button" onClick={() => performSubmit('Pending Approval')} disabled={loading}
            className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md">
            {loading ? 'Processing...' : 'Submit for City Admin Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDietFood;
