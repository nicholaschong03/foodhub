import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import aiFoodScannerService, { FoodAnalysisResult, ChatRequest } from '../../../services/aiFoodScannerService';

interface AIFoodResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: FoodAnalysisResult;
    backButton?: boolean; // if true, show back arrow instead of ×
    hideHealthScore?: boolean; // if true, do not show health score bar
}

const nutritionDisplayOrder = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
    { key: 'saturated_fat', label: 'Saturated fat', unit: 'g' },
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'sugar', label: 'Sugar', unit: 'g' },
    { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
    { key: 'vitamin_a', label: 'Vitamin A', unit: 'mcg' },
    { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg' },
    { key: 'vitamin_d', label: 'Vitamin D', unit: 'mcg' },
    { key: 'calcium', label: 'Calcium', unit: 'mg' },
    { key: 'iron', label: 'Iron', unit: 'mg' },
    { key: 'potassium', label: 'Potassium', unit: 'mg' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
];

// Helper to format dish name: replace underscores with spaces and capitalize each word
function formatDishName(name: string) {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const AIFoodResultsModal: React.FC<AIFoodResultsModalProps> = ({
    isOpen,
    onClose,
    results,
    backButton,
    hideHealthScore = false,
}) => {
    const { isDarkMode } = useTheme();
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai'; message: string }>>([]);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [tab, setTab] = useState<'ingredients' | 'nutrition'>('nutrition');

    const sendChatMessage = async () => {
        if (!chatMessage.trim()) return;
        const userMessage = chatMessage;
        setChatMessage('');
        setIsSendingMessage(true);
        setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
        try {
            const chatRequest: ChatRequest = {
                question: userMessage,
                dish_name: results.dishName,
                ingredients: results.ingredients,
                nutrition: results.nutrition,
            };
            const aiResponse = await aiFoodScannerService.sendChatMessage(chatRequest);
            setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse.answer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { type: 'ai', message: 'Sorry, I\'m having trouble responding right now. Please try again later.' }]);
        } finally {
            setIsSendingMessage(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold flex items-center">
                        <span className="text-2xl mr-2">🍽️</span>
                        {results.dishName ? formatDishName(results.dishName) : 'Food Analysis Results'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <span className="text-2xl">{backButton ? '←' : '×'}</span>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {!showChat ? (
                        <div className="p-6 space-y-6">
                            {/* Food Image */}
                            {results.imageUrl && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={results.imageUrl}
                                        alt={results.dishName || 'Food'}
                                        className="w-full max-w-sm h-48 object-cover rounded-xl shadow-lg"
                                    />
                                </div>
                            )}

                            {/* No Food Detected UI */}
                            {!results.isFood ? (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🤔</div>
                                    <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        No Food Detected
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        We couldn't identify any food in this image. Please try with a clearer photo of food.
                                    </p>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Tips for better results:</h4>
                                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                            <li>• Make sure the food is clearly visible in the image</li>
                                            <li>• Ensure good lighting and focus</li>
                                            <li>• Try taking the photo from a closer distance</li>
                                            <li>• Avoid blurry or dark images</li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Macro summary */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        {['protein', 'carbs', 'fat', 'sugar'].map((macro) => {
                                            const macroEmojis: Record<string, string> = {
                                                protein: '🥩',
                                                carbs: '🍚',
                                                fat: '🥑',
                                                sugar: '🍭',
                                            };
                                            return (
                                                <div key={macro} className="flex flex-col items-center flex-1">
                                                    <span className="text-2xl mb-1">{macroEmojis[macro]}</span>
                                                    <span className="text-sm font-semibold capitalize">
                                                        {macro === 'fat' ? 'Fat' : macro.charAt(0).toUpperCase() + macro.slice(1)}
                                                    </span>
                                                    <span className="text-lg font-bold">
                                                        {results.nutrition[macro] !== undefined && results.nutrition[macro] !== null
                                                            ? Math.round(results.nutrition[macro])
                                                            : '-'}
                                                        <span className="text-xs ml-1">{macro === 'protein' || macro === 'carbs' || macro === 'fat' || macro === 'sugar' ? 'g' : ''}</span>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Health Score */}
                                    {!hideHealthScore && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center mb-2">
                                            <div className="flex items-center w-full mb-2">
                                                <span className="text-sm font-medium mr-2">Health Score</span>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={10}
                                                    value={results.healthScore}
                                                    readOnly
                                                    className="flex-1 accent-orange-500"
                                                />
                                                <span className="ml-2 text-lg">{results.healthScore}</span>
                                                <span className="ml-2 text-xl">{results.healthScore >= 8 ? '😃' : results.healthScore >= 5 ? '😐' : '😬'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tabs */}
                                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-2">
                                        <button
                                            className={`flex-1 py-2 text-center font-medium ${tab === 'ingredients' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 dark:text-gray-300'}`}
                                            onClick={() => setTab('ingredients')}
                                        >
                                            Ingredients
                                        </button>
                                        <button
                                            className={`flex-1 py-2 text-center font-medium ${tab === 'nutrition' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 dark:text-gray-300'}`}
                                            onClick={() => setTab('nutrition')}
                                        >
                                            Nutrition
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    {tab === 'ingredients' ? (
                                        <div className="p-2">
                                            <ul className="space-y-2">
                                                {results.ingredients.length === 0 && <li className="text-gray-500">No ingredients detected.</li>}
                                                {results.ingredients.map((ingredient, idx) => (
                                                    <li key={idx} className="flex items-center">
                                                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                                                        <span>{ingredient}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            <ul className="space-y-1">
                                                {nutritionDisplayOrder.map(({ key, label, unit }) => (
                                                    <li key={key} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                                        <span>{label}</span>
                                                        <span className="font-medium">
                                                            {results.nutrition[key] !== undefined ? Math.round(results.nutrition[key]) : '-'} {unit}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                                        >
                                            Done
                                        </button>
                                        <button
                                            onClick={() => setShowChat(true)}
                                            className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
                                        >
                                            <span className="text-xl mr-2">💬</span>
                                            Ask AI Questions
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Chat Interface */
                        <div className="flex flex-col h-[calc(90vh-120px)]">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center">
                                        <span className="text-xl mr-2">💬</span>
                                        AI Food Assistant
                                    </h3>
                                    <button
                                        onClick={() => setShowChat(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        ← Back to Results
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Ask questions about {results.dishName ? formatDishName(results.dishName) : 'this food'}
                                </p>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chatHistory.length === 0 && (
                                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        <span className="text-4xl mb-4 block">🤖</span>
                                        <p>Ask me anything about this food!</p>
                                        <p className="text-sm mt-2">Try: "What are the health benefits?" or "How can I make this healthier?"</p>
                                    </div>
                                )}
                                {chatHistory.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700'
                                                }`}
                                        >
                                            {message.message}
                                        </div>
                                    </div>
                                ))}
                                {isSendingMessage && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                        placeholder="Ask about this food..."
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        disabled={isSendingMessage}
                                    />
                                    <button
                                        onClick={sendChatMessage}
                                        disabled={!chatMessage.trim() || isSendingMessage}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AIFoodResultsModal;