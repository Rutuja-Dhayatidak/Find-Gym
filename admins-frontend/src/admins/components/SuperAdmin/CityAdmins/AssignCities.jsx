import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { Search } from 'lucide-react';

const AssignCities = ({ isOpen, onClose, selectedCities, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelected, setLocalSelected] = useState([...selectedCities]);

  const allCities = [
    'Pimpri', 'Pune', 'Mumbai', 'Bangalore', 'Delhi', 
    'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 
    'Jaipur', 'Lucknow', 'Chandigarh'
  ];

  const filteredCities = allCities.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCity = (city) => {
    if (localSelected.includes(city)) {
      setLocalSelected(localSelected.filter(c => c !== city));
    } else {
      setLocalSelected([...localSelected, city]);
    }
  };

  const handleSave = () => {
    onSave(localSelected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Cities" size="sm">
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search cities..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
        {filteredCities.map(city => (
          <label 
            key={city} 
            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 mr-3"
              checked={localSelected.includes(city)}
              onChange={() => toggleCity(city)}
            />
            <span className="text-gray-700 text-sm">{city}</span>
          </label>
        ))}
        {filteredCities.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">No cities found</div>
        )}
      </div>

      <div className="mt-4 text-sm font-medium text-gray-700">
        {localSelected.length} cities selected
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Selection</Button>
      </div>
    </Modal>
  );
};

export default AssignCities;
