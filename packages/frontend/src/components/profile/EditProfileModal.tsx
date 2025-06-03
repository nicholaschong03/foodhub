import React, { useState } from 'react';
import { updateUserProfile } from '../../services/userService';
import DefaultProfileIcon from '../common/DefaultProfileIcon';
import Cropper from 'react-easy-crop';
import { createPortal } from 'react-dom';

const TABS = ['Basic', 'Physical', 'Preferences'];
const genderOptions = ['Male', 'Female', 'Prefer not to say'];
const activityOptions = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Super Active',
];
const restrictionOptions = [
  'None', 'Gluten-free', 'Halal', 'Dairy free', 'No Pork', 'No Beef', 'Vegetarian', 'Vegan',
];
const cuisineOptions = [
  'Chinese', 'Fusion', 'Indian', 'Italian', 'Japanese', 'Korean', 'Malaysian', 'Mexican', 'Middle Eastern', 'Thai', 'Vietnamese', 'Western', 'Continental',
];
const allergyOptions = [
  'None', 'Milk', 'Peanuts', 'Shellfish', 'Eggs', 'Wheat', 'Soy', 'Tree nuts', 'Fish', 'Sesame',
];

export default function EditProfileModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [tab, setTab] = useState('Basic');
  const [form, setForm] = useState({
    profilePicture: user.profilePicture || '',
    name: user.name || '',
    gender: user.gender || '',
    dob: user.dob ? user.dob.slice(0, 10) : '',
    height: user.height || 170,
    weight: user.weight || 70,
    goal: user.goal || '',
    activityLevel: user.activityLevel || '',
    restrictions: user.restrictions || [],
    cusines: user.cusines || [],
    allergies: user.allergies || [],
    adventurousness: user.adventurousness || 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleArray(
    field: 'restrictions' | 'cusines' | 'allergies',
    value: string
  ) {
    setForm(f => {
      const arr = f[field] as string[];
      if (value === 'None') return { ...f, [field]: arr.includes('None') ? [] : ['None'] };
      const withoutNone = arr.filter(v => v !== 'None');
      if (arr.includes(value)) return { ...f, [field]: withoutNone.filter(v => v !== value) };
      return { ...f, [field]: [...withoutNone, value] };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let payload = { ...form };
      // If profilePicture is a base64 string, convert to File
      if (form.profilePicture && typeof form.profilePicture === 'string' && form.profilePicture.startsWith('data:image')) {
        const file = dataURLtoFile(form.profilePicture, 'profile-picture.png');
        payload.profilePicture = file;
      }
      if (payload.height !== '') payload.height = Number(payload.height);
      if (payload.weight !== '') payload.weight = Number(payload.weight);
      await updateUserProfile(user._id, payload);
      onClose();
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  // Helper to convert base64 to File
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

  function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropModal(true);
    }
  }

  function onCropComplete(_: any, croppedAreaPixels: any) {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  async function getCroppedImg(imageSrc: string, cropPixels: any): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    const size = Math.max(cropPixels.width, cropPixels.height);
    canvas.width = size;
    canvas.height = size;
    // Draw white background for transparent PNGs
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      size,
      size
    );
    ctx.restore();
    return canvas.toDataURL('image/png');
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

  async function handleCropConfirm() {
    if (previewUrl && croppedAreaPixels) {
      const cropped = await getCroppedImg(previewUrl, croppedAreaPixels);
      setForm(f => ({ ...f, profilePicture: cropped }));
      setShowCropModal(false);
      setPreviewUrl(null);
    }
  }

  function handleCropCancel() {
    setShowCropModal(false);
    setPreviewUrl(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Edit Profile</h2>
        <div className="flex gap-2 mb-6 justify-center">
          {TABS.map(t => (
            <button
              key={t}
              className={`px-4 py-2 rounded-full font-semibold text-base transition ${tab === t ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-100'}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          {tab === 'Basic' && (
            <div>
              <div className="flex flex-col items-center mb-4">
                <label htmlFor="profilePic" className="relative cursor-pointer group">
                  {form.profilePicture ? (
                    <img src={form.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-orange-300" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-300">
                      <DefaultProfileIcon className="text-orange-400" size={48} />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-1 text-xs group-hover:bg-orange-600 transition">Edit</span>
                  <input id="profilePic" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                </label>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Name</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.name} onChange={e => handleChange('name', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Gender</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                  <option value="">Select gender</option>
                  {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          )}
          {tab === 'Physical' && (
            <div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Date of Birth</label>
                <input type="date" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.dob} onChange={e => handleChange('dob', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Height (cm)</label>
                <input type="number" min={100} max={250} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.height} onChange={e => handleChange('height', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Weight (kg)</label>
                <input type="number" min={30} max={300} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.weight} onChange={e => handleChange('weight', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Goal</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.goal} onChange={e => handleChange('goal', e.target.value)}>
                  <option value="">Select goal</option>
                  <option value="Lose weight">Lose weight</option>
                  <option value="Maintain">Maintain</option>
                  <option value="Gain Weight">Gain weight</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Activity Level</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.activityLevel} onChange={e => handleChange('activityLevel', e.target.value)}>
                  <option value="">Select activity</option>
                  {activityOptions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          )}
          {tab === 'Preferences' && (
            <div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {restrictionOptions.map(r => (
                    <button type="button" key={r} className={`px-3 py-1 rounded-full border ${form.restrictions.includes(r) ? 'bg-orange-100 border-orange-400 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => toggleArray('restrictions', r)}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Cuisines</label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map(c => (
                    <button type="button" key={c} className={`px-3 py-1 rounded-full border ${form.cusines.includes(c) ? 'bg-orange-100 border-orange-400 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => toggleArray('cusines', c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {allergyOptions.map(a => (
                    <button type="button" key={a} className={`px-3 py-1 rounded-full border ${form.allergies.includes(a) ? 'bg-orange-100 border-orange-400 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`} onClick={() => toggleArray('allergies', a)}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">Adventurousness</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg border ${form.adventurousness === n ? 'bg-orange-400 text-white border-orange-500' : 'bg-gray-100 text-gray-500 border-gray-200'}`} onClick={() => handleChange('adventurousness', n)}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className={`w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }} disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
      {showCropModal && previewUrl && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-6 relative w-full max-w-xs mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Crop Profile Picture</h3>
            <div className="relative w-64 h-64 bg-gray-100 rounded-full overflow-hidden mx-auto">
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCropCancel} className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">Cancel</button>
              <button onClick={handleCropConfirm} className="px-4 py-2 rounded font-medium bg-orange-500 text-white hover:bg-orange-600">Confirm</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}