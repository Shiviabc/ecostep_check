import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Beef, Fish, Salad, Carrot } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { addActivity, calculateDietEmissions } from '../../services/userService';

const dietTypes = [
  { id: 'meat', name: 'Meat-based', icon: <Beef className="h-6 w-6" />, baseline: 3.0 },
  { id: 'fish', name: 'Fish-based', icon: <Fish className="h-6 w-6" />, baseline: 1.5 },
  { id: 'vegetarian', name: 'Vegetarian', icon: <Salad className="h-6 w-6" />, baseline: 1.0 },
  { id: 'vegan', name: 'Vegan', icon: <Carrot className="h-6 w-6" />, baseline: 0.5 },
];

const Diet = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [meals, setMeals] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [carbonImpact, setCarbonImpact] = useState<number | null>(null);
  const { user } = useAuthStore();
  
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    
    // Recalculate carbon impact if meals is already set
    if (meals > 0) {
      const impact = calculateImpact(typeId, meals);
      setCarbonImpact(impact);
    }
  };
  
  const handleMealsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMeals = Number(e.target.value);
    setMeals(newMeals);
    
    // Recalculate carbon impact if diet type is already selected
    if (selectedType) {
      const impact = calculateImpact(selectedType, newMeals);
      setCarbonImpact(impact);
    }
  };
  
  const calculateImpact = (type: string, mealCount: number): number => {
    return calculateDietEmissions(type, mealCount);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || meals <= 0 || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate carbon impact
      let impact = calculateImpact(selectedType, meals);
      
      // For plant-based diets, calculate the savings compared to meat-based
      if (selectedType !== 'meat') {
        // Calculate what it would have been if meat-based
        const meatImpact = calculateDietEmissions('meat', meals);
        const actualImpact = impact;
        
        // The negative value represents carbon saved
        impact = -(meatImpact - actualImpact);
      }
      
      await addActivity(user.id, {
        category: 'diet',
        activity_type: selectedType,
        value: meals,
        carbon_impact: impact,
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setSelectedType(null);
      setMeals(1);
      setCarbonImpact(null);
    } catch (error) {
      console.error('Error adding diet activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Dietary Impact</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Record your food choices to track their environmental impact.
        </p>
      </div>
      
      {showSuccess && (
        <motion.div 
          className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-green-700 dark:text-green-400">
            Activity successfully recorded! {carbonImpact && carbonImpact < 0 ? `You saved ${Math.abs(carbonImpact).toFixed(2)} kg of CO2!` : ''}
          </p>
        </motion.div>
      )}
      
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Log Your Meals</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Meal Type
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dietTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    type="button"
                    className={`p-4 rounded-lg flex flex-col items-center justify-center border ${
                      selectedType === type.id 
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelectType(type.id)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`${
                      selectedType === type.id 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {type.icon}
                    </span>
                    <span className={`mt-2 text-sm font-medium ${
                      selectedType === type.id 
                        ? 'text-primary-700 dark:text-primary-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {type.name}
                    </span>
                    {selectedType === type.id && (
                      <span className="text-xs mt-1 text-primary-600 dark:text-primary-400">
                        {`${type.baseline} kg CO2/meal`}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="meals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Meals
              </label>
              <input
                id="meals"
                type="number"
                min="1"
                step="1"
                value={meals || ''}
                onChange={handleMealsChange}
                className="input"
                placeholder="Enter number of meals"
              />
            </div>
            
            {carbonImpact !== null && (
              <div className={`p-4 rounded-lg ${
                carbonImpact < 0 
                  ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                  : 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
              }`}>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Estimated Impact</h3>
                <p className={`text-lg font-bold ${
                  carbonImpact < 0 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {carbonImpact < 0 
                    ? `${Math.abs(carbonImpact).toFixed(2)} kg CO2 saved` 
                    : `${carbonImpact.toFixed(2)} kg CO2 emitted`}
                </p>
                {selectedType === 'meat' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Consider vegetarian or vegan meals to reduce your carbon footprint.
                  </p>
                )}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
                disabled={!selectedType || meals <= 0 || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Record Meals'}
                {!isSubmitting && <ArrowRight className="ml-1 h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dietary Impact Tips</h2>
        
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Replacing meat with plant-based alternatives just once a week can save up to 2.5 kg of CO2 per meal.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Choose locally grown, seasonal produce to reduce emissions from transportation and storage.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Reduce food waste by planning meals, storing food properly, and using leftovers.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>When buying animal products, look for sustainable and regenerative farming practices.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Diet;