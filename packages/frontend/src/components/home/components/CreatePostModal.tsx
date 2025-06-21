import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCEPTED_FORMATS = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

const aspectRatios = [
  { label: 'Original', value: null },
  { label: '1:1', value: 1 },
  { label: '3:4', value: 3 / 4 },
  { label: '4:3', value: 4 / 3 },
];

const foodCategories = ['Savory', 'Sweet'];
const cusineTypes = ['Chinese', 'Western', 'Japanese', 'Malay', 'Indian', 'Korean', 'Thai'];
const dietaryTags = ['Vegetarian', 'Vegan', 'Halal', 'Pescatarian', 'Pork-free', 'Beef-free', 'Dairy-free', 'Gluten-free'];

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '<YOUR_GOOGLE_MAPS_API_KEY>';
const DEFAULT_CENTER = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur as default
const MAP_CONTAINER_STYLE = { width: '100%', height: '300px' };

const MAP_LIBRARIES = ['places'] as const;

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'upload' | 'crop' | 'meta'>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Meta fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [cusineType, setCusineType] = useState('');
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [foodRating, setFoodRating] = useState(3);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantLocation, setRestaurantLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);

  const {
    ready,
    value: locationInput,
    setValue: setLocationInput,
    suggestions: { status, data },
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    debounce: 300,
    requestOptions: {
      types: ['establishment'], // restricts to businesses, including restaurants
      componentRestrictions: { country: 'my' }, // restrict to Malaysia, optional
    },
    initOnMount: false
  });

  // Google Places Autocomplete
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    if (isLoaded) {
      init();
    }
  }, [isLoaded, init])

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [menuItemName, setMenuItemName] = useState('');
  const [menuItemPrice, setMenuItemPrice] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
  const [tempLocation, setTempLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const [isPublishing, setIsPublishing] = useState(false);
  // Compute if all required fields are filled
  const isFormValid = Boolean(
    croppedImage &&
    title.trim() &&
    foodCategory &&
    cusineType &&
    menuItemName.trim() &&
    menuItemPrice &&
    /^\d+(\.\d{1,2})?$/.test(menuItemPrice) &&
    restaurantName.trim() &&
    restaurantLocation
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError('Only PNG, JPG, JPEG, and WEBP images are allowed.');
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }
    setError(null);
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStep('crop');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setCroppedImage(null);
    setError(null);
    setStep('upload');
    onClose();
  };

  const handleBack = () => {
    if (step === 'meta') {
      setStep('crop');
    } else {
      setStep('upload');
      setError(null);
      setPreviewUrl(null);
      setSelectedImage(null);
    }
  };

  // Crop image to data URL
  async function getCroppedImg(imageSrc: string, cropPixels: any): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return canvas.toDataURL('image/jpeg');
  }

  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', error => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  const handleConfirmCrop = async () => {
    if (previewUrl && croppedAreaPixels) {
      const cropped = await getCroppedImg(previewUrl, croppedAreaPixels);
      setCroppedImage(cropped);
      setStep('meta');
    }
  };

  const handleOpenLocationModal = () => {
    setShowLocationModal(true);
    // If a location is already selected, center map on it
    if (restaurantLocation) {
      setMapCenter({ lat: restaurantLocation.lat, lng: restaurantLocation.lng });
      setMarkerPosition({ lat: restaurantLocation.lat, lng: restaurantLocation.lng });
      setTempLocation(restaurantLocation);
    } else {
      setMapCenter(DEFAULT_CENTER);
      setMarkerPosition(DEFAULT_CENTER);
      setTempLocation(null);
    }
  };

  const handleSelectLocation = async (placeId: string, description: string) => {
    setLocationInput(description);
    clearSuggestions();
    const results = await getGeocode({ placeId });
    const { lat, lng } = await getLatLng(results[0]);
    setMapCenter({ lat, lng });
    setMarkerPosition({ lat, lng });
    setTempLocation({ name: description, lat, lng });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setTempLocation({ name: locationInput || 'Custom location', lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setTempLocation({ name: locationInput || 'Custom location', lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  const handleConfirmLocation = () => {
    if (tempLocation) {
      setRestaurantLocation(tempLocation);
      setShowLocationModal(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFormValid) return;
    setIsPublishing(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token); // DEBUG: log token for troubleshooting
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const formData = new FormData();

      // Convert croppedImage (base64) to File
      if (croppedImage) {
        const file = dataURLtoFile(croppedImage, 'post-image.jpg');
        formData.append('image', file);
      }

      formData.append('title', title);
      formData.append('description', description);
      formData.append('foodCategory', foodCategory);
      formData.append('cusineType', cusineType);
      formData.append('menuItemName', menuItemName);
      formData.append('menuItemPrice', String(Number(menuItemPrice)));
      formData.append('restaurantName', restaurantName);
      // Format restaurantLocation as GeoJSON
      if (restaurantLocation) {
        formData.append('restaurantLocation', JSON.stringify({
          type: 'Point',
          coordinates: [restaurantLocation.lng, restaurantLocation.lat]
        }));
      }
      formData.append('dietaryTags', JSON.stringify(selectedDietaryTags));
      formData.append('foodRating', String(Number(foodRating)));
      // Add authorId from user in localStorage
      if (user && user.id) {
        formData.append('authorId', user.id);
      }

      await axios.post('/api/posts/create-post', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create post');
    } finally {
      setIsPublishing(false);
    }
  };
  let content;
  if (step === 'upload') {
    content = (
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-orange-400 rounded-lg bg-gray-50 py-12 cursor-pointer transition hover:bg-orange-50"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <svg className="w-16 h-16 text-orange-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path d="M24 6v24m0 0l-8-8m8 8l8-8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <rect x="6" y="34" width="36" height="8" rx="2" fill="#fff" stroke="#F59E42" strokeWidth={2} />
        </svg>
        <p className="text-gray-700 font-medium">Drag & drop an image here or click to upload</p>
        <p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG, WEBP (max 32MB)</p>
        <div className="flex gap-3 mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpg, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            onClick={e => { e.stopPropagation(); handleClick(); }}
          >
            Upload Photo
          </button>
          {isMobile && (
            <>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              >
                Take Photo
              </button>
            </>
          )}
        </div>
      </div>
    );
  } else if (step === 'crop' && previewUrl) {
    content = (
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-[400px] h-[300px] bg-black rounded-lg overflow-hidden">
          <Cropper
            image={previewUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
          />
        </div>
        <div className="flex flex-col gap-4 w-full md:w-48">
          <div className="font-semibold mb-2">Aspect Ratio</div>
          <div className="grid grid-cols-2 gap-2">
            {aspectRatios.map((ar) => (
              <button
                key={ar.label}
                className={`border rounded px-2 py-1 text-sm font-medium transition-colors ${aspect === ar.value || (ar.value === null && aspect === null)
                  ? 'border-orange-500 text-orange-500 bg-orange-50'
                  : 'border-gray-300 text-gray-700 hover:border-orange-400'
                  }`}
                onClick={() => setAspect(ar.value)}
              >
                {ar.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
        </div>
      </div>
    );
  } else if (step === 'meta' && croppedImage) {
    content = (
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cropped image preview */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <img src={croppedImage} alt="Cropped Preview" className="max-h-64 rounded-lg shadow mb-4" />
        </div>
        {/* Metadata form */}
        <form className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Enter post title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea maxLength={1000} value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" rows={3} placeholder="Enter post description" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Food Category</label>
              <select value={foodCategory} onChange={e => setFoodCategory(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Select category</option>
                {foodCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Cuisine Type</label>
              <select value={cusineType} onChange={e => setCusineType(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Select cuisine</option>
                {cusineTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {dietaryTags.map(tag => (
                <button
                  type="button"
                  key={tag}
                  className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${selectedDietaryTags.includes(tag) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'}`}
                  onClick={() => setSelectedDietaryTags(selectedDietaryTags.includes(tag) ? selectedDietaryTags.filter(t => t !== tag) : [...selectedDietaryTags, tag])}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Food Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  type="button"
                  key={num}
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-lg font-bold transition-colors bg-white border-gray-300 hover:border-orange-400"
                  onClick={() => setFoodRating(num)}
                  onMouseEnter={() => setHoveredStar(num)}
                  onMouseLeave={() => setHoveredStar(null)}
                  style={{ background: (hoveredStar ?? foodRating) >= num ? '#fb923c' : 'white', color: (hoveredStar ?? foodRating) >= num ? 'white' : '#f59e42', borderColor: (hoveredStar ?? foodRating) >= num ? '#fb923c' : '#d1d5db' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={(hoveredStar ?? foodRating) >= num ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Menu Item Name</label>
            <input type="text" value={menuItemName} onChange={e => setMenuItemName(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Enter menu item name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Menu Item Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={menuItemPrice}
              onChange={e => {
                // Only allow up to 2 decimal places
                const val = e.target.value;
                if (/^\d*(\.\d{0,2})?$/.test(val)) {
                  setMenuItemPrice(val);
                }
              }}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter menu item price"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Restaurant Name</label>
            <input type="text" maxLength={120} value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Enter restaurant name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Restaurant Location</label>
            <button type="button" onClick={handleOpenLocationModal} className="px-4 py-2 rounded bg-orange-100 text-orange-700 font-medium hover:bg-orange-200 border border-orange-300">{restaurantLocation ? restaurantLocation.name : 'Add Location'}</button>
          </div>
        </form>
        {/* Location Modal with Map */}
        {showLocationModal && isLoaded && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-scaleIn">
              <button onClick={() => setShowLocationModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
              <h3 className="text-lg font-semibold mb-4">Search Location</h3>

              {loadError && <p className="text-red-500">Error loading Google Maps</p>}
              {!isLoaded ? (
                <p className="text-gray-500">Loading map…</p>
              ) : ready ? (
                <>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    placeholder="Search location"
                  />
                  {status === 'OK' && (
                    <ul className="border rounded max-h-40 overflow-y-auto mb-2">
                      {data.map(({ place_id, description }) => (
                        <li
                          key={place_id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSelectLocation(place_id, description)}
                        >
                          {description}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Loading location search…</p>
              )}
              <div className="mt-4">
                <div className="w-full h-72 rounded-lg overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={MAP_CONTAINER_STYLE}
                    center={mapCenter}
                    zoom={15}
                    onClick={handleMapClick}
                  >
                    <Marker
                      position={markerPosition}
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                    />
                  </GoogleMap>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowLocationModal(false)} className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">Cancel</button>
                  <button onClick={handleConfirmLocation} className="px-4 py-2 rounded font-medium bg-orange-500 text-white hover:bg-orange-600">Confirm</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 p-10 relative animate-scaleIn max-h-screen overflow-y-auto">
        {/* Close button */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-semibold text-center mb-6">
          {step === 'upload' ? 'Create New Post' : step === 'crop' ? 'Crop Image' : 'Post Details'}
        </h2>
        {loadError && <p>Error loading Google Maps</p>}
        {content}
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        <div className="flex justify-end gap-2 mt-8">
          {step !== 'upload' && (
            <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">Back</button>
          )}
          {step === 'crop' && (
            <button
              onClick={handleConfirmCrop}
              className="px-4 py-2 rounded font-medium bg-orange-500 text-white hover:bg-orange-600"
            >
              Confirm
            </button>
          )}
          {step === 'meta' && (
            <button
              type="submit"
              className="px-4 py-2 rounded font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              onClick={handlePublish}
              disabled={isPublishing || !isFormValid}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.2s; }
        .animate-scaleIn { animation: scaleIn 0.2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); } to { transform: scale(1); } }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreatePostModal;