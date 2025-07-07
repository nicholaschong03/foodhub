import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import aiFoodScannerService, { FoodAnalysisResult } from '../../../services/aiFoodScannerService';

interface AIFoodScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalysisComplete: (results: FoodAnalysisResult) => void;
}

const AIFoodScannerModal: React.FC<AIFoodScannerModalProps> = ({
    isOpen,
    onClose,
    onAnalysisComplete,
}) => {
    const { isDarkMode } = useTheme();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isMobile] = useState(window.innerWidth <= 768);
    const [useMockData, setUseMockData] = useState(false); // For testing purposes
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        try {
            let results: FoodAnalysisResult;

            if (useMockData) {
                // Use mock data for testing
                results = aiFoodScannerService.getMockAnalysisResult();
            } else {
                // Use real API
                results = await aiFoodScannerService.analyzeFoodImage(selectedImage);
            }

            onAnalysisComplete(results);
            onClose();
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Failed to analyze image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold flex items-center">
                        <span className="text-2xl mr-2">🤖</span>
                        AI Food Scanner
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Scanning Animation Overlay */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
                            {imagePreview && (
                                <div className="relative w-48 h-48 mb-6">
                                    <img
                                        src={imagePreview}
                                        alt="Scanning food"
                                        className="w-full h-full object-cover rounded-xl shadow-lg"
                                    />
                                    {/* Advanced scanning animation: laser line + shimmer */}
                                    <div className="absolute left-0 top-0 w-full h-full overflow-hidden rounded-xl pointer-events-none">
                                        <div className="scan-laser" />
                                        <div className="scan-shimmer" />
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col items-center">
                                <div className="mb-2 text-orange-500 text-2xl animate-pulse">🍽️</div>
                                <div className="font-semibold text-lg mb-1">Scanning your food...</div>
                                <div className="text-gray-500 dark:text-gray-300 text-sm">This may take a few seconds</div>
                            </div>
                        </div>
                    )}

                    {!imagePreview && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🍽️</span>
                                </div>
                                <h3 className="text-lg font-medium mb-2">Scan Your Food</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Take a photo or upload an image of your food for AI analysis
                                </p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                                >
                                    <span className="text-xl mr-2">📁</span>
                                    Upload Image
                                </button>
                                {isMobile && (
                                    <>
                                        <button
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
                                        >
                                            <span className="text-xl mr-2">📷</span>
                                            Take Photo
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Development toggle for testing */}
                            {import.meta.env.DEV && (
                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <label className="flex items-center text-sm">
                                        <input
                                            type="checkbox"
                                            checked={useMockData}
                                            onChange={(e) => setUseMockData(e.target.checked)}
                                            className="mr-2"
                                        />
                                        Use Mock Data (Development)
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="space-y-4">
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Selected food"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <button
                                    onClick={resetImage}
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={resetImage}
                                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={analyzeImage}
                                    disabled={isAnalyzing}
                                    className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        'Analyze Food'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    {isMobile && (
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AIFoodScannerModal;