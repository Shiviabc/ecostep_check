import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Recycle, Trash, Banana, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { addActivity, calculateWasteEmissions } from '../../services/userService';

const wasteTypes = [
  { id: 'general', name: 'General Waste', icon: <Trash className="h-6 w-6" />, baseline: 2.5 },
  { id: 'recyclable', name: 'Recyclable', icon: <Recycle className="h-6 w-6" />, baseline: 1.0 },
  { id: 'biodegradable', name: 'Biodegradable', icon: <Banana className="h-6 w-6" />, baseline: 0.8 },
  { id: 'compost', name: 'Compost', icon: <Trash2 className="h-6 w-6" />, baseline: 0.2 },
];

const Waste = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [carbonImpact, setCarbonImpact] = useState<number | null>(null);
  const { user } = useAuthStore();
  
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    
    // Recalculate carbon impact if weight is already set
    if (weight > 0) {
      const impact = calculateImpact(typeId, weight);
      setCarbonImpact(impact);
    }
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = Number(e.target.value);
    setWeight(newWeight);
    
    // Recalculate carbon impact if waste type is already selected
    if (selectedType) {
      const impact = calculateImpact(selectedType, newWeight);
      setCarbonImpact(impact);
    }
  };
  
  const calculateImpact = (type: string, wt: number): number => {
    return calculateWasteEmissions(type, wt);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || weight <= 0 || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate carbon impact
      let impact = calculateImpact(selectedType, weight);
      
      // For recycling and composting, calculate the savings compared to general waste
      if (selectedType !== 'general') {
        // Calculate what it would have been if general waste
        const generalImpact = calculateWasteEmissions('general', weight);
        const actualImpact = impact;
        
        // The negative value represents carbon saved
        impact = actualImpact - generalImpact;
      }
      
      await addActivity(user.id, {
        category: 'waste',
        activity_type: selectedType,
        value: weight,
        carbon_impact: impact,
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setSelectedType(null);
      setWeight(0);
      setCarbonImpact(null);
    } catch (error) {
      console.error('Error adding waste activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Waste Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Record your waste disposal methods to track their environmental impact.
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Log Your Waste</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Waste Type
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wasteTypes.map((type) => (
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
                        {`${type.baseline} kg CO2/kg`}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={weight || ''}
                onChange={handleWeightChange}
                className="input"
                placeholder="Enter weight in kilograms"
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
                {carbonImpact > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Consider recycling or composting to reduce your carbon footprint.
                  </p>
                )}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
                disabled={!selectedType || weight <= 0 || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Record Waste'}
                {!isSubmitting && <ArrowRight className="ml-1 h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Waste Management Tips</h2>
        
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Recycling paper, plastic, glass, and metal can reduce carbon emissions by up to 60% compared to sending them to landfill.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Composting food waste reduces methane emissions from landfills and creates nutrient-rich soil for gardening.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Reduce waste by choosing products with minimal packaging or bringing your own containers for shopping.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Donate or repurpose items instead of throwing them away to extend their useful life.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Waste;