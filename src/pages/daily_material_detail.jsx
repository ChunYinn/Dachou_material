import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function DailyMaterialDetail() {
  const { date } = useParams();
  const [groupedData, setGroupedData] = useState({});
  const [mainGlueCollector, setMainGlueCollector] = useState('');
  const [promoterCollector, setPromoterCollector] = useState('');

  // Assuming the user role is stored in local storage
  const userRole = localStorage.getItem('userRole');

  // Set the initial state based on the user's role
  const initialButtonState = userRole === 'promoter' ? '促進劑領料單' : '主膠領料單';
  const [selectedButton, setSelectedButton] = useState(initialButtonState);

  const [showNotesDialog, setShowNotesDialog] = useState(false); // State to control dialog visibility
  const [selectedNotes, setSelectedNotes] = useState(''); // State to store notes value
  const [popOutPosition, setPopOutPosition] = useState({ x: 0, y: 0 });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [chemicalDetails, setChemicalDetails] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  

  // Function to show the dialog when the icon is clicked
  const handleIconClick = async(chemicalRawMaterialId, materialId, event) => {
    setSelectedNotes(chemicalRawMaterialId);
    setSelectedRowId(materialId); // Set the ID of the selected row
    const iconRect = event.currentTarget.getBoundingClientRect();
    setPopOutPosition({
      x: iconRect.left + window.scrollX,
      y: iconRect.top + window.scrollY,
    });
    setShowNotesDialog(true);

    try {
      // Fetch the chemical input details from the backend
      const response = await axios.get(`http://localhost:5000/get-chemical-input-detail/${chemicalRawMaterialId}`);
      setChemicalDetails(response.data);
    } catch (error) {
      console.error('Error fetching chemical input details:', error);
      setChemicalDetails([]);
    }
  };  
  
  
  // Function to close the dialog
  const closeNotesDialog = () => {
    setShowNotesDialog(false);
    setSelectedRowId(null);
  };

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
              collecting_status: !!curr.collecting_finished,
              notes: curr.notes || ''
            });
            return acc;
          }, {});
          setGroupedData(groupedByBatch);
        })
        .catch(error => {
          console.error('Error fetching details:', error);
        });

        // Fetch collector names
        axios.get(`http://localhost:5000/get-collector-names/${date}`)
        .then(response => {
          const { main_glue_collector, promoter_collector } = response.data;
          setMainGlueCollector(main_glue_collector || '');
          setPromoterCollector(promoter_collector || '');
        })
        .catch(error => {
          console.error('Error fetching collector names:', error);
        });
    }
  }, [date]);

  //Frontend: update collector
  const updateCollectorName = async (collectorName, type) => {
    try {
      // Define the URL based on the type (main_glue or promoter)
      const urlType = type === 'promoter' ? 'promoter' : 'main-glue';
      const url = `http://localhost:5000/update-collector/${urlType}/${date}`;

      // Send the PUT request
      const response = await axios.put(url, { collector: collectorName });
      console.log('Update response:', response.data);
      
      // You can handle state update if necessary
    } catch (error) {
      console.error('Error updating collector name:', error);
    }
  };
  
  const handleCollectorInputChange = (e) => {
    const { value } = e.target;
    if (selectedButton === '促進劑領料單') {
      setPromoterCollector(value);
    } else {
      setMainGlueCollector(value);
    }
  };
  
  const handleCollectorInputBlur = () => {
    if (selectedButton === '促進劑領料單') {
      updateCollectorName(promoterCollector, 'promoter');
    } else {
      updateCollectorName(mainGlueCollector, 'main-glue');
    }
  };
  

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
  
  //--UPDATE 備註-----------------------------------------------
  const updateNotesInGroupedData = (materialId, newNotes) => {
    setGroupedData(prevData => {
      return Object.fromEntries(
        Object.entries(prevData).map(([batchKey, batchDetails]) => {
          const updatedMaterials = batchDetails.materials.map(material => {
            if (material.daily_material_formula_id === materialId) {
              return { ...material, notes: newNotes };
            }
            return material;
          });
  
          return [batchKey, { ...batchDetails, materials: updatedMaterials }];
        })
      );
    });
  };
  
  const handleNotesChange = async (id, newNotes) => {
    try {
      const response = await axios.put(`http://localhost:5000/update-notes/${id}`, {
        notes: newNotes,
      });
      console.log('Update response:', response.data);
  
      // Update the notes in groupedData state
      updateNotesInGroupedData(id, newNotes);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  // Function to handle changes in the notes input
  const handleNotesInputChange = (materialId, newNotes) => {
    updateNotesInGroupedData(materialId, newNotes);
  };
  //------------------------------------------------------------

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

  // Function to determine if a button should be displayed based on the role
  const shouldDisplayButton = (buttonType) => {
    if (userRole === 'manager') {
      return true;
    }
    if (userRole === 'main glue' && buttonType === '主膠領料單') {
      return true;
    }
    if (userRole === 'promoter' && buttonType === '促進劑領料單') {
      return true;
    }
    return false;
  };

  //check whether there's data
  const groupedDataEntries = Object.entries(groupedData);

  return (
    <div className="flex flex-col items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-2xl text-indigo-600 font-bold mb-6 mt-12">
        打料日期 {date}
      </p>
  
      {/* Button group with visual indication for the selected button */}
      <div className="isolate inline-flex rounded-md mb-6">
        {shouldDisplayButton('主膠領料單') && (
          <button
            className={`relative w-32 inline-flex items-center justify-center ${
              shouldDisplayButton('促進劑領料單') ? 'rounded-l-md' : 'rounded-md'
            } px-3 py-2 text-sm font-semibold ring-1 ring-indigo-300 ${
              selectedButton === '主膠領料單'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white hover:bg-indigo-300 text-indigo-800'
            }`}
            onClick={() => handleButtonClick('主膠領料單')}
          >
            主膠領料單
          </button>
        )}
        {shouldDisplayButton('促進劑領料單') && (
          <button
            className={`relative -ml-px w-32 inline-flex items-center justify-center ${
              shouldDisplayButton('主膠領料單') ? 'rounded-r-md' : 'rounded-md'
            } px-3 py-2 text-sm font-semibold ring-1 ring-indigo-300 ${
              selectedButton === '促進劑領料單'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white hover:bg-indigo-300 text-indigo-800'
            }`}
            onClick={() => handleButtonClick('促進劑領料單')}
          >
            促進劑領料單
          </button>
        )}
      </div>
      
      <div className='flex items-center mb-5'>
        <label htmlFor="collector" className="text-md font-bold text-gray-700">
          {selectedButton === '促進劑領料單' ? '促進劑領料人:' : '主膠領料人:'}
        </label>
        <input
          id="collector"
          name="collector"
          type="text"
          required
          className="ml-2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="完成請輸入名稱"
          value={selectedButton === '促進劑領料單' ? promoterCollector : mainGlueCollector}
          onChange={handleCollectorInputChange}
          onBlur={handleCollectorInputBlur}
        />
      </div>    
  
      {groupedDataEntries.length > 0 ? (
        <div className={`flex flex-wrap ${!showNotesDialog && 'justify-center'} -mx-2 w-full mb-24`}>
          {groupedDataEntries.map(([batchNumber, details]) => {
            const filteredMaterials = details.materials.filter((material) =>
              shouldDisplayMaterial(material.chemical_raw_material_id, selectedButton)
            );
  
            return (
              <div key={details.daily_material_formula_id} className="mt-4 p-4 border rounded shadow-sm w-full mx-2 mb-4 max-w-4xl">

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
                  <table className="min-w-full divide-y divide-gray-200 ">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"120px"}}>化工原料ID</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"120px"}}>化工名稱</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"120px"}}>用量/KG</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"120px"}}>是否完成</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"349px"}}>備註</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaterials.length > 0 ? (
                        filteredMaterials.map((material) => (
                          <tr key={material.daily_material_formula_id} className={`bg-white ${selectedRowId === material.daily_material_formula_id ? 'bg-yellow-100' : ''}`}>
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
                            <td className="flex px-4 py-3 whitespace-nowrap text-gray-700">
                              <input
                                  type="text"
                                  value={material.notes}
                                  onChange={(event) => handleNotesInputChange(material.daily_material_formula_id, event.target.value)}
                                  onBlur={(event) => handleNotesChange(material.daily_material_formula_id, event.target.value)}
                                  className="w-full px-2 py-1 border-b border-indigo-300 focus:outline-none focus:border-indigo-500"
                                  placeholder="..."
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-5 w-10 h-10 text-indigo-600 hover:text-indigo-500 rounded-full p-2 hover:bg-indigo-100" onClick={(event) => handleIconClick(material.chemical_raw_material_id, material.daily_material_formula_id, event)}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>
                                {showNotesDialog && (
                                  <div
                                    className="absolute z-50 bg-yellow-100 p-4 rounded shadow-md"
                                    style={{
                                      width: '400px',
                                      top: popOutPosition.y - 25,
                                      left: popOutPosition.x + 56,
                                    }}
                                  >
                                    <table className="min-w-full divide-y divide-gray-300">
                                      <thead>
                                        <tr>
                                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">膠料批號</th>
                                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">硬度</th>
                                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">剩餘公斤</th>
                                          <th className="relative px-3 py-3 text-sm font-semibold text-gray-900">使用公斤</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {chemicalDetails.map((detail, index) => (
                                          <tr key={index}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.chemical_raw_material_batch_no}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.input_test_hardness}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.batch_kg}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                              <input
                                                type="number"
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={userInputs[detail.chemical_raw_material_batch_no] || ''}
                                                onChange={(e) => setUserInputs({ ...userInputs, [detail.chemical_raw_material_batch_no]: e.target.value })}
                                                placeholder="輸入.."
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    <div className="mt-4 flex justify-end">
                                      <button
                                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={closeNotesDialog}
                                      >
                                        Close
                                      </button>
                                    </div>
                                  </div>
                                )}

                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10 max-w-4xl">
                            <p className="text-lg text-gray-500">無需求</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 border rounded shadow-sm w-full mx-2 mb-4 max-w-4xl text-center py-10 ">
          <p className="text-lg text-gray-500">無資料</p>
        </div>
      )}
    </div>
  );
}  
