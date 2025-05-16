import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, LightbulbOff, Wind, Zap, PlugZap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { addActivity, calculateEnergyEmissions } from '../../services/userService';

const energyTypes = [
  { id: 'fossil', name: 'Fossil Fuels', icon: <Zap className="h-6 w-6" />, baseline: 0.5 },
  { id: 'mixed', name: 'Mixed Sources', icon: <PlugZap className="h-6 w-6" />, baseline: 0.3 },
  { id: 'renewable', name: 'Renewable', icon: <Wind className="h-6 w-6" />, baseline: 0.1 },
  { id: 'saved', name: 'Energy Saved', icon: <LightbulbOff className="h-6 w-6" />, baseline: 0 },
];

const Energy = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [carbonImpact, setCarbonImpact] = useState<number | null>(null);
  const { user } = useAuthStore();
  
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    
    // Recalculate carbon impact if amount is already set
    if (amount > 0) {
      const impact = calculateImpact(typeId, amount);
      setCarbonImpact(impact);
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Number(e.target.value);
    setAmount(newAmount);
    
    // Recalculate carbon impact if energy type is already selected
    if (selectedType) {
      const impact = calculateImpact(selectedType, newAmount);
      setCarbonImpact(impact);
    }
  };
  
  const calculateImpact = (type: string, energyAmount: number): number => {
    if (type === 'saved') {
      // For energy saved, calculate the savings compared to fossil fuel energy
      return -calculateEnergyEmissions('fossil', energyAmount);
    }
    return calculateEnergyEmissions(type, energyAmount);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || amount <= 0 || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate carbon impact
      const impact = calculateImpact(selectedType, amount);
      
      await addActivity(user.id, {
        category: 'energy',
        activity_type: selectedType,
        value: amount,
        carbon_impact: impact,
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setSelectedType(null);
      setAmount(0);
      setCarbonImpact(null);
    } catch (error) {
      console.error('Error adding energy activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Energy Consumption</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Record your energy usage to track its environmental impact.
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Log Your Energy Usage</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Energy Type
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {energyTypes.map((type) => (
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
                    {selectedType === type.id && type.id !== 'saved' && (
                      <span className="text-xs mt-1 text-primary-600 dark:text-primary-400">
                        {`${type.baseline} kg CO2/kWh`}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {selectedType === 'saved' ? 'Energy Saved (kWh)' : 'Energy Consumed (kWh)'}
              </label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.1"
                value={amount || ''}
                onChange={handleAmountChange}
                className="input"
                placeholder="Enter energy in kilowatt-hours"
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
                    Consider reducing energy usage or switching to renewable sources.
                  </p>
                )}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
                disabled={!selectedType || amount <= 0 || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Record Energy'}
                {!isSubmitting && <ArrowRight className="ml-1 h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Energy Saving Tips</h2>
        
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Switch to LED bulbs, which use 75% less energy than incandescent lighting.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Unplug electronic devices when not in use or use smart power strips to eliminate phantom energy use.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Consider switching to a renewable energy provider or installing solar panels.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Use a programmable thermostat to optimize heating and cooling when you're home and away.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Energy;