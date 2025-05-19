import { useState } from 'react'
import axios from 'axios'

function App() {
  const [count, setCount] = useState(0)
  const [healthStatus, setHealthStatus] = useState<string>('')

  const checkHealth = async () => {
    try {
      const response = await axios.get('/api/health')
      setHealthStatus(`API Status: ${response.data.ok ? '✅ Healthy' : '❌ Unhealthy'}`)
    } catch (error) {
      setHealthStatus('❌ API Error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Welcome to FoodHub</h1>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-4"
                  onClick={() => setCount((count) => count + 1)}
                >
                  Count is {count}
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  onClick={checkHealth}
                >
                  Check API Health
                </button>
                {healthStatus && (
                  <p className="mt-4 text-center">{healthStatus}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App