import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';

export default function DailyMaterialDetail() {
  const { date } = useParams();
  const [groupedData, setGroupedData] = useState({});
  const [selectedButton, setSelectedButton] = useState('主膠領料單');

  useEffect(() => {
    if (date) {
      axios.get(`http://localhost:5000/get-material-detail/${date}`)
        .then(response => {
          const fetchedData = response.data;
          const groupedByBatch = fetchedData.reduce((acc, curr) => {
            const batchKey = curr.batch_number;
            if (!acc[batchKey]) {
              acc[batchKey] = {
                order: curr.batch_number.split('-')[1],
                daily_material_formula_id: curr.daily_material_formula_id,
                material_id: curr.material_id,
                total_demand: curr.total_demand,
                production_machine: curr.production_machine,
                materials: []
              };
            }
            acc[batchKey].materials.push({
              daily_material_formula_id: curr.daily_material_formula_id,
              chemical_raw_material_id: curr.chemical_raw_material_id,
              chemical_raw_material_name: curr.chemical_raw_material_name,
              usage_kg: curr.usage_kg,
              collecting_status: !!curr.collecting_finished, // Adjust according to your collecting_finished values
              notes: curr.notes || ''
            });
            return acc;
          }, {});
          setGroupedData(groupedByBatch);
        })
        .catch(error => {
          console.error('Error fetching details:', error);
        });
    }
  }, [date]);

  // Frontend: Method to call the update API
  const updateCollectingStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/update-collecting-status/${id}`, {
        collecting_finished: newStatus ? 1 : 0, // Assuming the backend expects 1 or 0 for true/false
      });
      console.log('Update response:', response.data);
  
      // Update local state to reflect the change
      setGroupedData((prevData) => {
        // Create a deep copy of the state
        const newData = JSON.parse(JSON.stringify(prevData));
  
        // Find and update the specific material
        Object.values(newData).forEach((batch) => {
          batch.materials.forEach((material) => {
            if (material.daily_material_formula_id === id) {
              material.collecting_status = newStatus;
            }
          });
        });
  
        return newData;
      });
  
    } catch (error) {
      console.error('Error updating collecting status:', error);
    }
  };
  
  const handleCheckboxChange = (id, currentStatus) => {
    const newStatus = !currentStatus; // Toggle the status
    updateCollectingStatus(id, newStatus);
  };
  
  const updateNotes = async (id, newNotes) => {
    try {
      const response = await axios.put(`http://localhost:5000/update-notes/${id}`, {
        notes: newNotes,
      });
      console.log('Update response:', response.data);
      // Optionally refresh the data or directly update the state to reflect changes
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleNotesChange = (id, notes) => {
    console.log('Notes for ID', id, ':', notes);
    updateNotes(id, notes);
  };

  // Function to handle button click
  const handleButtonClick = (buttonType) => {
    setSelectedButton(buttonType);
  };

  const shouldDisplayMaterial = (materialId, buttonType) => {
    const secondLetter = materialId.charAt(1).toUpperCase();
    if (buttonType === '主膠領料單') {
      return secondLetter >= 'A' && secondLetter <= 'I';
    } else {
      return secondLetter < 'A' || secondLetter > 'I';
    }
  };

  return (
    <div className="flex flex-col items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-2xl text-indigo-600 font-bold mb-6 mt-12">
        打料日期 {date}
      </p>

      {/* Button group with visual indication for the selected button */}
      <div className="isolate inline-flex rounded-md mb-6">
        <button
          className={`relative w-32 inline-flex items-center justify-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-indigo-300 ${selectedButton === '主膠領料單' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white hover:bg-indigo-300 text-indigo-800'}`}
          onClick={() => handleButtonClick('主膠領料單')}
        >
          主膠領料單
        </button>
        <button
          className={`relative -ml-px w-32 inline-flex items-center justify-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-indigo-300 ${selectedButton === '促進劑領料單' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white hover:bg-indigo-300 text-indigo-800'}`}
          onClick={() => handleButtonClick('促進劑領料單')}
        >
          促進劑領料單
        </button>
      </div>

      {/* Iterate over groupedData to display each batch */}
      <div className="flex flex-wrap justify-center -mx-2">
      {Object.entries(groupedData).map(([batchNumber, details]) => (
        <div key={details.daily_material_formula_id} className="p-4 border rounded shadow-sm w-full lg:w-3/4 mx-2 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">打料單號 {details.order}</h3>
            <h3 className="text-lg font-medium">機台: {details.production_machine}</h3>
            <h3 className="text-lg font-medium">{batchNumber}</h3>
          </div>
          <div className="flex justify-between mb-4">
            <p className="text-lg font-medium">膠料編號: {details.material_id}</p>
            <p className="text-lg">總生產量: {details.total_demand}</p>
          </div>
          <div className="w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">化工原料ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">化工名稱</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">用量/KG</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">是否完成</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">備註</th>
                </tr>
              </thead>
              <tbody>
              {details.materials
                  .filter((material) => shouldDisplayMaterial(material.chemical_raw_material_id, selectedButton))
                  .map((material, index) => (
                  <tr key={material.daily_material_formula_id} className="bg-white">
                    <td className="px-4 py-2 whitespace-nowrap text-md text-gray-500">{material.chemical_raw_material_id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{material.chemical_raw_material_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {material.usage_kg}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="checkbox"
                        checked={material.collecting_status}
                        onChange={() => handleCheckboxChange(material.daily_material_formula_id, material.collecting_status)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          <input
                            type="text"
                            defaultValue={material.notes}
                            onBlur={(event) => handleNotesChange(material.daily_material_formula_id, event.target.value)}
                            className="w-full px-2 py-1 border-b border-indigo-300 focus:outline-none focus:border-indigo-500" // Tailwind CSS styles for underline only
                            placeholder="輸入備註..."
                          />
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      ))}
      </div>
    </div>
  );
}
