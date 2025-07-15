export interface NutritionValues {
    [key: string]: number;
}

export interface FoodAnalysisResult {
    dishName: string;
    ingredients: string[];
    healthScore: number;
    nutrition: NutritionValues;
    nutritionRaw: any; // for tabular display
    imageUrl?: string;
    isFood: boolean; // indicates if food was detected in the image
}

export interface ChatRequest {
    question: string;
    dish_name: string;
    ingredients: string[];
    nutrition: NutritionValues;
    image?: string;
}

export interface ChatResponse {
    answer: string;
    gemini_raw?: any;
}

export interface FoodDetectionResult {
    is_food: boolean;
    confidence: number;
}

class AIFoodScannerService {
    private baseURL = import.meta.env.VITE_AI_FOOD_SCANNER_API_URL || 'https://your-flask-api.onrender.com';

    /**
     * Analyze food image using AI
     * @param imageFile - The image file to analyze
     * @returns Promise<FoodAnalysisResult>
     */
    async analyzeFoodImage(imageFile: File): Promise<FoodAnalysisResult> {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);

            const response = await fetch(`${this.baseURL}/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiResult = await response.json();
            // Map API response to FoodAnalysisResult
            const dishName = apiResult.food_classification?.dish_name || '';
            const ingredients = (apiResult.segmentation?.combined_analysis?.ingredients || []).map((i: any) => i.name);
            const healthScore = apiResult.segmentation?.health_analysis?.health_score || 0;
            const nutritionRaw = apiResult.segmentation?.nutrition_data?.total_nutrition || {};
            const nutrition: NutritionValues = {
                calories: nutritionRaw.total_calories,
                protein: nutritionRaw.total_protein,
                fat: nutritionRaw.total_fat,
                saturated_fat: nutritionRaw.total_saturated_fat,
                carbs: nutritionRaw.total_carbohydrate,
                fiber: nutritionRaw.total_fiber,
                sugar: nutritionRaw.total_sugars,
                cholesterol: nutritionRaw.total_cholesterol,
                vitamin_a: nutritionRaw.total_vitamin_a,
                vitamin_c: nutritionRaw.total_vitamin_c,
                vitamin_d: nutritionRaw.total_vitamin_d,
                calcium: nutritionRaw.total_calcium,
                iron: nutritionRaw.total_iron,
                potassium: nutritionRaw.total_potassium,
                sodium: nutritionRaw.total_sodium,
            };

            // Create a data URL for the image
            const imageUrl = await this.fileToDataURL(imageFile);

            // Check if food was detected (from food_detection.is_food field)
            const isFood = apiResult.food_detection?.is_food !== false; // default to true if field is missing

            return {
                dishName,
                ingredients,
                healthScore,
                nutrition,
                nutritionRaw,
                imageUrl,
                isFood,
            };
        } catch (error) {
            console.error('Error analyzing food image:', error);
            throw new Error('Failed to analyze food image. Please try again.');
        }
    }

    /**
     * Convert file to data URL
     * @param file - The file to convert
     * @returns Promise<string> - The data URL
     */
    private fileToDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Send chat message to AI assistant
     * @param chatRequest - The chat request with context
     * @returns Promise<ChatResponse>
     */
    async sendChatMessage(chatRequest: ChatRequest): Promise<ChatResponse> {
        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chatRequest),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error sending chat message:', error);
            throw new Error('Failed to send message. Please try again.');
        }
    }

    /**
     * Detect if an image contains food
     * @param imageFile - The image file to check
     * @returns Promise<FoodDetectionResult>
     */
    async detectFood(imageFile: File): Promise<FoodDetectionResult> {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);

            // Call AI API directly
            const response = await fetch(`${this.baseURL}/detect-food`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return {
                is_food: result.is_food,
                confidence: result.confidence,
            };
        } catch (error) {
            console.error('Error detecting food:', error);
            throw new Error('Failed to detect food in image. Please try again.');
        }
    }

    /**
     * Get mock analysis results for testing (remove in production)
     */
    getMockAnalysisResult(): FoodAnalysisResult {
        return {
            dishName: 'Grilled Chicken Salad',
            ingredients: [
                'Grilled chicken breast',
                'Mixed greens',
                'Cherry tomatoes',
                'Cucumber',
                'Red onion',
                'Olive oil',
                'Balsamic vinegar',
                'Salt',
                'Black pepper',
            ],
            healthScore: 8,
            nutrition: {
                calories: 320,
                protein: 35,
                total_fat: 18,
                saturated_fat: 4,
                carbs: 12,
                fiber: 6,
                sugar: 8,
                sodium: 450,
                vitamin_a: 1025,
                vitamin_c: 15,
                vitamin_d: 0,
                calcium: 50,
                iron: 0,
                potassium: 202,
            },
            nutritionRaw: {
                calories: 320,
                protein: 35,
                total_fat: 18,
                saturated_fat: 4,
                carbs: 12,
                fiber: 6,
                sugar: 8,
                sodium: 450,
                vitamin_a: 1025,
                vitamin_c: 15,
                vitamin_d: 0,
                calcium: 50,
                iron: 0,
                potassium: 202,
            },
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNhNDFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HcmlsbGVkIENoaWNrZW4gU2FsYWQ8L3RleHQ+PC9zdmc+',
            isFood: true,
        };
    }

    /**
     * Get mock analysis results for no food detected (testing)
     */
    getMockNoFoodResult(): FoodAnalysisResult {
        return {
            dishName: '',
            ingredients: [],
            healthScore: 0,
            nutrition: {
                calories: 0,
                protein: 0,
                total_fat: 0,
                saturated_fat: 0,
                carbs: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0,
                vitamin_a: 0,
                vitamin_c: 0,
                vitamin_d: 0,
                calcium: 0,
                iron: 0,
                potassium: 0,
            },
            nutritionRaw: {},
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2NjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBGb29kPC90ZXh0Pjwvc3ZnPg==',
            isFood: false,
        };
    }

    /**
     * Get mock chat response for testing (remove in production)
     */
    getMockChatResponse(question: string): ChatResponse {
        const responses: Record<string, string> = {
            'health benefits': "This grilled chicken salad is a great choice! It's high in protein (35g) which helps with muscle building and repair. The mixed greens provide fiber and essential vitamins. The olive oil contains healthy monounsaturated fats that support heart health.",
            'make healthier': "To make this salad even healthier, you could: 1) Add more vegetables like bell peppers or avocado, 2) Use a lighter dressing or less oil, 3) Add nuts or seeds for extra nutrients, 4) Consider using skinless chicken breast to reduce fat content.",
            'calories': "This grilled chicken salad contains 320 calories, which is a moderate amount for a meal. It's well-balanced with 35g protein, 12g carbs, and 18g fat, making it suitable for most dietary goals.",
            'protein': "This salad is excellent for protein! With 35g of protein from the grilled chicken breast, it provides about 70% of the daily recommended protein intake for an average adult. Protein helps with muscle maintenance and keeps you feeling full longer.",
        };
        const lower = question.toLowerCase();
        let answer = "This is a nutritious grilled chicken salad with good protein content and healthy fats. It's a balanced meal choice!";
        for (const [key, value] of Object.entries(responses)) {
            if (lower.includes(key)) {
                answer = value;
                break;
            }
        }
        return {
            answer,
            gemini_raw: {},
        };
    }

    /**
     * Get mock food detection result for testing
     */
    getMockFoodDetectionResult(): FoodDetectionResult {
        return {
            is_food: true,
            confidence: 0.95,
        };
    }
}

export const aiFoodScannerService = new AIFoodScannerService();
export default aiFoodScannerService;