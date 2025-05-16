import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bike, Bus, Car, Plane, Train, Scaling as Walking } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { addActivity, calculateTransportEmissions } from '../../services/userService';

const transportTypes = [
  { id: 'car', name: 'Car', icon: <Car className="h-6 w-6" />, baseline: 0.12 },
  { id: 'bus', name: 'Bus', icon: <Bus className="h-6 w-6" />, baseline: 0.05 },
  { id: 'train', name: 'Train', icon: <Train className="h-6 w-6" />, baseline: 0.03 },
  { id: 'flight', name: 'Flight', icon: <Plane className="h-6 w-6" />, baseline: 0.15 },
  { id: 'bike', name: 'Bicycle', icon: <Bike className="h-6 w-6" />, baseline: 0 },
  { id: 'walk', name: 'Walking', icon: <Walking className="h-6 w-6" />, baseline: 0 },
];

const Transport = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [carbonImpact, setCarbonImpact] = useState<number | null>(null);
  const { user } = useAuthStore();
  
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    
    // Recalculate carbon impact if distance is already set
    if (distance > 0) {
      const impact = calculateImpact(typeId, distance);
      setCarbonImpact(impact);
    }
  };
  
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDistance = Number(e.target.value);
    setDistance(newDistance);
    
    // Recalculate carbon impact if transport type is already selected
    if (selectedType) {
      const impact = calculateImpact(selectedType, newDistance);
      setCarbonImpact(impact);
    }
  };
  
  const calculateImpact = (type: string, dist: number): number => {
    return calculateTransportEmissions(type, dist);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || distance <= 0 || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate carbon impact
      let impact = calculateImpact(selectedType, distance);
      
      // For zero-emission transport methods, calculate the savings compared to car travel
      if (selectedType === 'bike' || selectedType === 'walk') {
        // Calculate what it would have been if traveled by car
        const carImpact = calculateTransportEmissions('car', distance);
        // The negative value represents carbon saved
        impact = -carImpact;
      }
      
      await addActivity(user.id, {
        category: 'transport',
        activity_type: selectedType,
        value: distance,
        carbon_impact: impact,
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setSelectedType(null);
      setDistance(0);
      setCarbonImpact(null);
    } catch (error) {
      console.error('Error adding transport activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Transport Emissions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Record your transportation methods to track their environmental impact.
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Log Your Journey</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Transport Method
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {transportTypes.map((type) => (
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
                        {type.baseline === 0 
                          ? 'Zero emissions' 
                          : `${type.baseline} kg CO2/km`}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Distance (km)
              </label>
              <input
                id="distance"
                type="number"
                min="0"
                step="0.1"
                value={distance || ''}
                onChange={handleDistanceChange}
                className="input"
                placeholder="Enter distance in kilometers"
              />
            </div>
            
            {carbonImpact !== null && (
              <div className={`p-4 rounded-lg ${
                carbonImpact <= 0 
                  ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                  : 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
              }`}>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Estimated Impact</h3>
                <p className={`text-lg font-bold ${
                  carbonImpact <= 0 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {carbonImpact === 0 
                    ? 'Zero carbon emissions!' 
                    : carbonImpact < 0 
                      ? `${Math.abs(carbonImpact).toFixed(2)} kg CO2 saved` 
                      : `${carbonImpact.toFixed(2)} kg CO2 emitted`}
                </p>
                {carbonImpact > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Consider using a lower-emission transport method for future journeys.
                  </p>
                )}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
                disabled={!selectedType || distance <= 0 || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Record Journey'}
                {!isSubmitting && <ArrowRight className="ml-1 h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transport Tips</h2>
        
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Walking or cycling for short trips can save up to 0.12 kg of CO2 per kilometer.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Public transportation like buses and trains produce significantly fewer emissions per passenger than private cars.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>If you must drive, consider carpooling to reduce per-person emissions.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Try to combine multiple errands into a single trip to reduce overall distance traveled.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Transport;