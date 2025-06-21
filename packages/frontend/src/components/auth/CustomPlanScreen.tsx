import { useEffect, useState } from 'react';
// import logoOrange from '../../assets/logo_orange.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const macroColors = {
  Calories: 'text-orange-500',
  Carbs: 'text-orange-400',
  Protein: 'text-red-400',
  Fats: 'text-blue-400',
};

const logoOrange = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516307/logo_orange_rf4tri.png';


// function getBMIColor(bmi: number) {
//   if (bmi < 18.5) return 'bg-red-400';
//   if (bmi < 25) return 'bg-green-400';
//   if (bmi < 30) return 'bg-yellow-400';
//   return 'bg-red-400';
// }

function BMIScale({ bmi }: { bmi: number }) {
  // Scale: 12 (min) to 40 (max)
  const minBMI = 12, maxBMI = 40;
  const percent = Math.min(100, Math.max(0, ((bmi - minBMI) / (maxBMI - minBMI)) * 100));
  return (
    <div className="w-full mt-4 mb-2">
      <div className="relative h-4 rounded-full bg-gradient-to-r from-yellow-400 via-green-400 via-60% to-red-400">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white shadow"
          style={{ left: `calc(${percent}% - 12px)`, background: '#FF6A00' }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1 text-gray-500">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
      <div className="text-center mt-2 font-bold text-lg" style={{ color: '#FF6A00' }}>
        Your BMI: {bmi}
      </div>
    </div>
  );
}

export default function CustomPlanScreen({ userId, onClose }: { userId: string, onClose?: () => void }) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/users/${userId}/custom-plan`)
      .then(res => {
        setPlan(res.data.data);
        setLoading(false);
      });
  }, [userId]);

  if (loading || !plan) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <img src={logoOrange} alt="Loading Logo" className="w-24 h-24 mb-8 animate-spin" />
        <div className="text-2xl font-bold" style={{ color: '#FF6A00' }}>
          Generating your custom plan...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative w-full max-w-md md:max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-8">
        <div className="pt-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Congratulations<br />your custom plan is ready!</h2>
          {/* BMI Scale */}
          <BMIScale bmi={parseFloat(plan.bmi)} />
          <div className="bg-orange-50 rounded-2xl p-4 md:p-8 mb-6 mt-6">
            <div className="text-lg font-semibold text-gray-900 mb-8">Daily recommendation</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MacroCard label="Calories" value={plan.calories} unit="" color={macroColors.Calories} />
              <MacroCard label="Carbs" value={plan.carbs} unit="g" color={macroColors.Carbs} />
              <MacroCard label="Protein" value={plan.protein} unit="g" color={macroColors.Protein} />
              <MacroCard label="Fats" value={plan.fats} unit="g" color={macroColors.Fats} />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-pink-400 text-xl">💖</span>
                <span className="text-gray-700 text-sm">Health Score</span>
              </div>
              <div className="text-gray-900 font-bold text-lg">{plan.healthScore}/10</div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(plan.healthScore / 10) * 100}%`,
                  background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)',
                }}
              />
            </div>
          </div>
          <button
            className="w-full py-3 rounded-2xl text-white font-semibold text-lg"
            style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
            onClick={() => navigate('/feed')}
          >
            Let's get started!
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col items-center shadow-sm">
      <div className={`text-2xl mb-1 ${color}`}>
        {label === 'Calories' ? '🔥' : label === 'Carbs' ? '🌾' : label === 'Protein' ? '🍗' : '🥑'}
      </div>
      <div className="text-gray-700 text-sm">{label}</div>
      <div className="font-bold text-xl text-gray-900">
        {value}
        <span className="text-sm font-normal text-gray-500">{unit}</span>
      </div>
    </div>
  );
}