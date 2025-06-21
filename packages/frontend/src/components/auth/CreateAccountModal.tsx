import React, { useState } from 'react';
// import logoOrange from '../../assets/logo_orange.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/auth.service';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genderOptions = ['Male', 'Female', 'Prefer not to say'];

const logoOrange = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516307/logo_orange_rf4tri.png';


const CreateAccountModal: React.FC = () => {
  const [step, setStep] = useState(1);
  // Step 1
  const [email, setEmail] = useState('');
  const [emailAvailable, setEmailAvailable] = useState<null | boolean>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailCheckTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [password, setPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  // Step 2
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameCheckTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [gender, setGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  // Step 3
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  // Step 4
  const [goal, setGoal] = useState('');
  // Step 5 (Activity Level)
  const activityOptions = [
    {
      label: 'Sedentary',
      emoji: '🪑',
      desc: 'Little or no exercise, mostly sitting (e.g., desk job)'
    },
    {
      label: 'Lightly Active',
      emoji: '🚶',
      desc: 'Light exercise or walking 1–3 days a week'
    },
    {
      label: 'Moderately Active',
      emoji: '🏋️',
      desc: 'Moderate exercise 3–5 days a week'
    },
    {
      label: 'Very Active',
      emoji: '🏃',
      desc: 'Hard exercise or sports 6–7 days a week'
    },
    {
      label: 'Super Active',
      emoji: '🧗',
      desc: 'Intense training twice a day or a physically demanding job'
    }
  ];
  const [activityLevel, setActivityLevel] = useState('');
  const isStepActivityDisabled = !activityLevel;
  // Step 6
  const restrictionOptions = [
    { label: 'None', icon: '🚫' },
    { label: 'Gluten-free', icon: '🌾' },
    { label: 'Halal', icon: '🕌' },
    { label: 'Dairy free', icon: '🥛🚫' },
    { label: 'No Pork', icon: '🐖🚫' },
    { label: 'No Beef', icon: '🐄🚫' },
    { label: 'Vegetarian', icon: '🥦' },
    { label: 'Vegan', icon: '🌱' },
  ];
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const isStep5Disabled = restrictions.length === 0;
  // Step 7
  const cuisineOptions = [
    { label: 'All', icon: '🧑‍🍳' },
    { label: 'Chinese', icon: '🥢' },
    { label: 'Fusion', icon: '🍱' },
    { label: 'Indian', icon: '🍛' },
    { label: 'Italian', icon: '🍕' },
    { label: 'Japanese', icon: '🍣' },
    { label: 'Korean', icon: '🍜' },
    { label: 'Malaysian', icon: '🍲' },
    { label: 'Mexican', icon: '🌮' },
    { label: 'Middle Eastern', icon: '��' },
    { label: 'Thai', icon: '🍤' },
    { label: 'Vietnamese', icon: '🍜' },
    { label: 'Western', icon: '🍔' },
    { label: 'Continental', icon: '🥐' },
  ];
  const [cuisines, setCuisines] = useState<string[]>([]);
  const isStep6Disabled = cuisines.length === 0;
  // Step 8
  const allergyOptions = [
    { label: 'None', icon: '🚫' },
    { label: 'Milk', icon: '🥛' },
    { label: 'Peanuts', icon: '🥜' },
    { label: 'Shellfish', icon: '🦐' },
    { label: 'Eggs', icon: '🥚' },
    { label: 'Wheat', icon: '🌾' },
    { label: 'Soy', icon: '🌱' },
    { label: 'Tree nuts', icon: '🌰' },
    { label: 'Fish', icon: '🐟' },
    { label: 'Sesame', icon: '⚪' },
  ];
  const [allergies, setAllergies] = useState<string[]>([]);
  const isStep7Disabled = allergies.length === 0;
  // Step 9
  const [adventurousness, setAdventurousness] = useState('3');
  const [showLoader, setShowLoader] = useState(false);
  const isStep8Disabled = !adventurousness;
  const navigate = useNavigate();

  // Validation
  const isEmailValid = emailRegex.test(email);
  const isStep1Disabled =
    !email ||
    !password ||
    !isEmailValid ||
    (password && !passwordValid) ||
    emailAvailable !== true ||
    checkingEmail;
  const isStep2Disabled = !name || !username || !gender;
  // Validation for step 3
  const isDobValid = Boolean(dob);
  const isHeightValid = !!height && !isNaN(Number(height)) && Number(height) > 0;
  const isWeightValid = !!weight && !isNaN(Number(weight)) && Number(weight) > 0;
  const isStep3Disabled = !isDobValid || !isHeightValid || !isWeightValid;
  // Validation for step 4
  const isStep4Disabled = !goal;

  // Username input handler: prevent spaces
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters and numbers
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setUsername(value);
    setUsernameAvailable(null);
    if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);
    if (value) {
      setCheckingUsername(true);
      // Real API call to check username availability
      usernameCheckTimeout.current = setTimeout(() => {
        axios.get(`/api/users/check-username?username=${encodeURIComponent(value)}`)
          .then(res => {
            setUsernameAvailable(res.data.available);
            setCheckingUsername(false);
          })
          .catch(() => {
            setUsernameAvailable(null);
            setCheckingUsername(false);
          });
      }, 700);
    } else {
      setCheckingUsername(false);
    }
  };

  const clearUsername = () => {
    setUsername('');
    setUsernameAvailable(null);
    setCheckingUsername(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value.length >= 8);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailAvailable(null);
    if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
    if (value && emailRegex.test(value)) {
      setCheckingEmail(true);
      emailCheckTimeout.current = setTimeout(() => {
        axios.get(`/api/users/check-email?email=${encodeURIComponent(value)}`)
          .then(res => {
            setEmailAvailable(res.data.available);
            setCheckingEmail(false);
          })
          .catch(() => {
            setEmailAvailable(null);
            setCheckingEmail(false);
          });
      }, 700);
    } else {
      setCheckingEmail(false);
    }
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Disabled) setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Disabled) {
      setStep(3);
    }
  };

  const toggleRestriction = (label: string) => {
    if (label === "None") {
      setRestrictions(prev =>
        prev.includes("None") ? [] : ["None"]
      );
    } else {
      setRestrictions(prev => {
        const withoutNone = prev.filter(r => r !== "None");
        if (prev.includes(label)) {
          return withoutNone.filter(r => r !== label);
        } else {
          return [...withoutNone, label];
        }
      });
    }
  };

  const toggleCuisine = (label: string) => {
    if (label === "All") {
      const allLabelsExceptAll = cuisineOptions.map(opt => opt.label).filter(l => l !== "All");
      const allSelected = allLabelsExceptAll.every(l => cuisines.includes(l));
      setCuisines(allSelected ? [] : allLabelsExceptAll);
    } else {
      setCuisines(prev => {
        const withoutAll = prev.filter(l => l !== "All");
        if (prev.includes(label)) {
          return withoutAll.filter(l => l !== label);
        } else {
          return [...withoutAll, label];
        }
      });
    }
  };

  const toggleAllergy = (label: string) => {
    if (label === "None") {
      setAllergies(prev =>
        prev.includes("None") ? [] : ["None"]
      );
    } else {
      setAllergies(prev => {
        const withoutNone = prev.filter(a => a !== "None");
        if (prev.includes(label)) {
          return withoutNone.filter(a => a !== label);
        } else {
          return [...withoutNone, label];
        }
      });
    }
  };

  // Submit handler for the last step
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep8Disabled) {
      setShowLoader(true);
      try {
        const userData = {
          email,
          password,
          name,
          username,
          gender,
          dob: new Date(dob),
          height: Number(height),
          weight: Number(weight),
          goal,
          activityLevel,
          restrictions,
          cusines: cuisines,
          allergies,
          adventurousness: Number(adventurousness),
        };

        const { user } = await register(userData);

        // Navigate to CustomPlanScreen with the user ID
        navigate(`/custom-plan/${user.id}`);
      } catch (err) {
        console.error('Registration error:', err);
        setShowLoader(false);
      }
    }
  };

  if (showLoader) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <img
          src={logoOrange}
          alt="Loading Logo"
          className="w-48 h-48 mb-8 animate-spin"
          style={{ animationDuration: '1.2s' }}
        />
        <div className="text-2xl font-bold -mt-10" style={{ color: '#FF6A00', fontFamily: 'Open Sans, sans-serif' }}>
          We're setting everything up for you
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Close/back button */}
        <button
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
          onClick={step === 1 ? () => navigate(-1) : () => setStep(step - 1)}
          aria-label={step === 1 ? 'Close' : 'Back'}
        >
          &larr;
        </button>
        {step === 1 && (
          <form onSubmit={handleStep1} className="pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Create your account</h2>
            <div className="mb-4">
              <label className={`block text-gray-700 text-sm mb-1 ${email && emailAvailable === false ? 'text-red-500' : email && emailAvailable === true ? 'text-orange-500' : ''}`} htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${email
                  ? emailAvailable === false
                    ? 'border-red-400 text-red-500'
                    : emailAvailable === true
                      ? 'border-orange-400 text-orange-500'
                      : 'border-orange-200'
                  : 'border-gray-200'
                  }`}
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
              />
              {!isEmailValid && email && (
                <span className="text-xs text-red-500 mt-1 block">Please enter a valid email address.</span>
              )}
              {email && !checkingEmail && emailAvailable === true && (
                <span className="text-xs text-green-600 mt-1 block">Available</span>
              )}
              {email && !checkingEmail && emailAvailable === false && (
                <span className="text-xs text-red-500 mt-1 block">Email already registered</span>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Set your password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${password && !passwordValid ? 'border-red-400 text-red-500' : 'border-gray-200'}`}
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
              />
              {password && !passwordValid && (
                <span className="text-xs text-red-500 mt-1 block">Password must be at least 8 characters.</span>
              )}
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition ${isStep1Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep1Disabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleStep2} className="pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Setup your profile</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="mb-4">
              <label
                className={`block text-sm mb-1 ${username ? (usernameAvailable === false ? 'text-red-500' : usernameAvailable === true ? 'text-orange-500' : 'text-gray-700') : 'text-gray-700'}`}
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  placeholder="Set username"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${username
                    ? usernameAvailable === false
                      ? 'border-red-400 text-red-500'
                      : usernameAvailable === true
                        ? 'border-orange-400 text-orange-500'
                        : 'border-orange-200'
                    : 'border-gray-200'
                    }`}
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="username"
                />
                {username && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                    onClick={clearUsername}
                    tabIndex={-1}
                  >
                    ×
                  </button>
                )}
              </div>
              {username && !checkingUsername && usernameAvailable === true && (
                <span className="text-xs text-green-600 mt-1 block">Available</span>
              )}
              {username && !checkingUsername && usernameAvailable === false && (
                <span className="text-xs text-red-500 mt-1 block">Not available</span>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm mb-1">Gender</label>
              <button
                type="button"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-400"
                onClick={() => setShowGenderModal(true)}
              >
                <span className={gender ? 'text-gray-900' : 'text-gray-400'}>
                  {gender || 'Select gender'}
                </span>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-orange-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition ${isStep2Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep2Disabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={e => { e.preventDefault(); if (!isStep3Disabled) setStep(4); }} className="pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Setup your profile</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-1" htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={dob}
                onChange={e => setDob(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-1" htmlFor="height">Height (cm)</label>
              <div className="flex items-center gap-4">
                <input
                  id="height"
                  type="range"
                  min="100"
                  max="250"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="flex-1"
                />
                <span className="w-12 text-right">{height} cm</span>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm mb-1" htmlFor="weight">Weight (kg)</label>
              <div className="flex items-center gap-4">
                <input
                  id="weight"
                  type="range"
                  min="20"
                  max="200"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="flex-1"
                />
                <span className="w-12 text-right">{weight} kg</span>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition ${isStep3Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep3Disabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 4 && (
          <form onSubmit={e => { e.preventDefault(); if (!isStep4Disabled) setStep(5); }} className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">What is your dietary goal?</h2>
            <p className="text-gray-600 mb-8 text-left">This helps us generate a plan for your calorie intake.</p>
            <div className="flex flex-col gap-4 mb-8">
              {['Lose weight', 'Maintain', 'Gain weight'].map(option => (
                <button
                  type="button"
                  key={option}
                  className={`w-full rounded-2xl px-4 py-4 text-lg font-semibold transition text-left ${goal === option
                    ? 'bg-orange-400 text-white font-bold'
                    : 'bg-gray-50 text-black'
                    }`}
                  onClick={() => setGoal(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${isStep4Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep4Disabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 5 && (
          <form onSubmit={e => { e.preventDefault(); if (!isStepActivityDisabled) setStep(6); }} className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">How active are you on typical day?</h2>
            <p className="text-gray-600 mb-8 text-left">Select the option that best describes your daily activity level.</p>
            <div className="flex flex-col gap-4 mb-8">
              {activityOptions.map(opt => (
                <button
                  type="button"
                  key={opt.label}
                  className={`w-full rounded-2xl px-4 py-4 flex items-center gap-4 transition text-left border-2 ${activityLevel === opt.label
                    ? 'bg-orange-400 border-orange-400 text-white font-bold'
                    : 'bg-gray-50 border-gray-200 text-black'
                    }`}
                  onClick={() => setActivityLevel(opt.label)}
                >
                  <span className="text-2xl mr-2">{opt.emoji}</span>
                  <div>
                    <div className="text-lg font-semibold">{opt.label}</div>
                    <div className="text-xs text-gray-700 font-normal">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${isStepActivityDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStepActivityDisabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 6 && (
          <form onSubmit={e => { e.preventDefault(); if (!isStep5Disabled) setStep(7); }} className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">Do you have any dietary restrictions?</h2>
            <p className="text-gray-600 mb-8 text-left">Select all that apply</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {restrictionOptions.map(opt => {
                const selected = restrictions.includes(opt.label);
                return (
                  <button
                    type="button"
                    key={opt.label}
                    className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 border text-sm font-semibold transition h-16 ${selected
                      ? 'border-orange-400 text-orange-500 bg-orange-50'
                      : 'border-gray-200 text-gray-700 bg-white'
                      }`}
                    onClick={() => toggleRestriction(opt.label)}
                  >
                    <span className="text-lg mb-1">{opt.icon}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${isStep5Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep5Disabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 7 && (
          <form onSubmit={e => { e.preventDefault(); if (!isStep6Disabled) setStep(8); }} className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">Which cuisines do you enjoy the most?</h2>
            <p className="text-gray-600 mb-8 text-left">Select all that apply</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {cuisineOptions.map(opt => {
                const selected = cuisines.includes(opt.label);
                return (
                  <button
                    type="button"
                    key={opt.label}
                    className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 border text-sm font-semibold transition h-16 ${selected
                      ? 'border-orange-400 text-orange-500 bg-orange-50'
                      : 'border-gray-200 text-gray-700 bg-white'
                      }`}
                    onClick={() => toggleCuisine(opt.label)}
                  >
                    <span className="text-lg mb-1">{opt.icon}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${isStep6Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep6Disabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 8 && (
          <form onSubmit={e => { e.preventDefault(); if (!isStep7Disabled) setStep(9); }} className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">Do you have any food allergies?</h2>
            <p className="text-gray-600 mb-8 text-left">Select all that apply</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {allergyOptions.map(opt => {
                const selected = allergies.includes(opt.label);
                const noneSelected = allergies.includes("None");
                const disableOther = noneSelected && opt.label !== "None";
                const disableNone = !noneSelected && allergies.length > 0 && opt.label === "None";
                return (
                  <button
                    type="button"
                    key={opt.label}
                    className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 border text-sm font-semibold transition h-16 ${selected
                      ? 'border-orange-400 text-orange-500 bg-orange-50'
                      : 'border-gray-200 text-gray-700 bg-white'
                      }`}
                    onClick={() => toggleAllergy(opt.label)}
                    disabled={disableOther || disableNone}
                  >
                    <span className="text-lg mb-1">{opt.icon}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${isStep7Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep7Disabled}
            >
              Continue
            </button>
          </form>
        )}
        {step === 9 && (
          <form onSubmit={handleCreateProfile} className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">How adventurous are you with food?</h2>
            <p className="text-gray-600 mb-8 text-left">Rate your willingness to try new foods and cuisines</p>
            <div className="flex gap-2 mb-8 justify-center">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  type="button"
                  key={n}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 transition ${Number(adventurousness) === n
                    ? 'bg-orange-400 text-white border-orange-500'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                    }`}
                  onClick={() => setAdventurousness(n.toString())}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="text-center mb-8">
              <div className="text-sm text-gray-600">
                {Number(adventurousness) === 1 && "Very conservative - I prefer familiar foods"}
                {Number(adventurousness) === 2 && "Somewhat conservative - I like some variety"}
                {Number(adventurousness) === 3 && "Moderate - I'm open to trying new things"}
                {Number(adventurousness) === 4 && "Adventurous - I love exploring new cuisines"}
                {Number(adventurousness) === 5 && "Very adventurous - I'll try anything once"}
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${isStep8Disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
              disabled={isStep8Disabled}
            >
              Create profile
            </button>
          </form>
        )}
        {/* Gender selection modal */}
        {showGenderModal && (
          <div className="fixed inset-0 z-60 flex items-end justify-center bg-black bg-opacity-30">
            <div className="w-full max-w-md bg-white rounded-t-2xl p-6 pb-8">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-center text-base font-semibold mb-4">Select gender</h3>
              {genderOptions.map(option => (
                <button
                  key={option}
                  className={`w-full flex items-center justify-between px-4 py-3 mb-2 rounded-lg border ${gender === option ? 'border-orange-400 bg-orange-50' : 'border-gray-200'} transition`}
                  onClick={() => { setGender(option); setShowGenderModal(false); }}
                >
                  <span className="text-gray-900">{option}</span>
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full border ${gender === option ? 'border-orange-400' : 'border-gray-300'}`}>{gender === option && <span className="w-3 h-3 bg-orange-400 rounded-full inline-block" />}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccountModal;