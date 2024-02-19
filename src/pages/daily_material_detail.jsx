import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
// In another file where you want to use the above functions
const { findBestMaterialCombination} = require('./find_material_combination');


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
  const [popOutPosition, setPopOutPosition] = useState({ x: 0, y: 0 });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedBatchNumber, setSelectedBatchNumber] = useState('');
  const [activeMaterialId, setActiveMaterialId] = useState('');
  const [chemicalDetails, setChemicalDetails] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [calculationResults, setCalculationResults] = useState({}); // State to store the calculation results 
  const [currentHardness, setCurrentHardness] = useState({}); // State to store the current hardness

  // Function to show the dialog when the icon is clicked
  const handleIconClick = async(batchNumber, chemicalRawMaterialId, materialId, event) => {
    setSelectedBatchNumber(batchNumber);
    setActiveMaterialId(materialId);
    console.log('Icon clicked:', batchNumber, chemicalRawMaterialId, materialId);
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

  //formate like: HE-R9-30-01-W
  const validateMaterialID = (id) => {
    const regex = /^[A-Z]{2}-[A-Z][0-9]-[0-9]{2}-[0-9]{2}-[A-Z]$/;
    return regex.test(id);
  };

  // Extract Hardness from Material ID
  const extractHardnessFromID = (id) => {
    if (!validateMaterialID(id)) return 0;
    const parts = id.split('-');
    const hardness = parseInt(parts[2], 10);
    return isNaN(hardness) ? 0 : hardness;
  };

  // Assuming groupedData and other utility functions like validateMaterialID, extractHardnessFromID are defined elsewhere
  const handleCalculateOptimalHardness = async (batchNumber) => {
    console.log(`Calculating optimal hardness for batch: ${batchNumber}`);

    const batchInfo = groupedData[batchNumber];
    if (!batchInfo) {
      console.error(`No data found for batch number: ${batchNumber}`);
      return;
    }

    const materialID = batchInfo.material_id;
    console.log('Material ID:', materialID);
    const hardness = validateMaterialID(materialID) ? extractHardnessFromID(materialID) : 0.00;

    const formulaRequirements = batchInfo.materials.reduce((acc, material) => {
      const secondLetter = material.chemical_raw_material_id.charAt(1).toUpperCase();
      if (secondLetter >= 'A' && secondLetter <= 'I') {
        acc[material.chemical_raw_material_id] = parseFloat(material.usage_kg);
      }
      return acc;
    }, {});

    const uniqueMaterialIDs = Object.keys(formulaRequirements);

    const fetchMaterialDetails = async (id) => {
      const response = await fetch(`http://localhost:5000/get-chemical-input-detail/${id}`);
      const data = await response.json();
      return data.map(detail => ({
        batchNumber: detail.chemical_raw_material_batch_no,
        kg: parseFloat(detail.batch_kg),
        hardness: parseInt(detail.input_test_hardness, 10),
        position: detail.chemical_raw_material_position,
      }));
    };

    Promise.all(uniqueMaterialIDs.map(fetchMaterialDetails)).then(materialDetails => {
      const materials = uniqueMaterialIDs.reduce((acc, id, index) => {
        acc[id] = materialDetails[index];
        return acc;
      }, {});

      const result = findBestMaterialCombination(materials, formulaRequirements, hardness, batchNumber);
      console.log(result);

      const parsedResult = result

      // Update the UI based on the results
      if (parsedResult.error) {
        alert(parsedResult.error);
      } else {
        console.log('Best combination:', parsedResult.bestCombinationDetails);
        updateMaterialsBatchNumber(batchNumber, result.bestCombinationDetails);

        //store the recommended batch number in the database
        result.bestCombinationDetails.forEach(async (detail) => {
          await updateRecommendedBatchNumberInDatabase(findDailyMaterialFormulaId(batchNumber, detail.material), detail.batchNumber);
        });

        // Map over parsedResult.bestCombinationDetails to update userInputs
          const newInputsForBatch = parsedResult.bestCombinationDetails.reduce((acc, detail) => {
            if (!acc[detail.material]) acc[detail.material] = {};
            acc[detail.material][detail.batchNumber] = detail.kg.toString();
            return acc;
        }, {});

        setUserInputs(prevInputs => ({
            ...prevInputs,
            [batchNumber]: newInputsForBatch // Update inputs for this batch
        }));

        setCalculationResults(prevResults => ({
          ...prevResults,
          [batchNumber]: parsedResult
        }));

        setCurrentHardness(prevHardness => ({
          ...prevHardness,
          [batchNumber]: parsedResult.finalAvgHardness.toFixed(2) // Keeping two decimal points for hardness
        }));
      }

      console.log('User inputs:', userInputs);
    });
  };

  //update recommended batch number in the groupedData state
  const updateMaterialsBatchNumber = (batchNumber, bestCombinationDetails) => {
    setGroupedData(prevData => {
      const newData = { ...prevData };
      if (newData[batchNumber]) {
        newData[batchNumber].materials = newData[batchNumber].materials.map(material => {
          // Find the corresponding update details for this material
          const update = bestCombinationDetails.find(detail => detail.material === material.chemical_raw_material_id);
          if (update) {
            // Update the material with new batch number and position
            return { 
              ...material, 
              rec_chemical_raw_material_batch_no: update.batchNumber,
              position: update.position // Assuming 'position' is the key where position data is stored
            };
          }
          return material;
        });
      }
      return newData;
    });
  };
  
  //for finding the row id (daily_material_formula_id)
  const findDailyMaterialFormulaId = (batchNumber, chemicalRawMaterialId) => {
    const batchData = groupedData[batchNumber];
  
    if (batchData && batchData.materials) {
      const material = batchData.materials.find(material => material.chemical_raw_material_id === chemicalRawMaterialId);
      if (material) {
        return material.daily_material_formula_id; // Return the found daily_material_formula_id
      }
    }
  
    return null; // Return null if no matching material is found
  };

  const updateRecommendedBatchNumberInDatabase = async (materialId, recBatchNo) => {
    try {
      const response = await axios.put(`http://localhost:5000/update-recommended-batch/${materialId}`, { recBatchNo });
      console.log('Update response:', response.data);
    } catch (error) {
      console.error('Error updating recommended batch number:', error);
    }
  };
  
  //-----------------------------------------------------------------------
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
              rec_chemical_raw_material_batch_no: curr.rec_chemical_raw_material_batch_no,
              position: curr.chemical_raw_material_position,
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
  //------handle recommendation batch change------------------------------------------------------


  // Function to handle button click-----------------------------------
  const handleButtonClick = (buttonType) => {
    if (showNotesDialog) {
      closeNotesDialog();
    }

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

  //----hardness calculation--------------------------------
  const recalculateHardnessForBatch = (batchNumber) => {
    let totalKg = 0;
    let totalHardnessKg = 0;
  
    // Check if the batchNumber exists in updatedInputs, if not, set initial hardness to 0
    if (!userInputs[batchNumber]) {
      setCurrentHardness(prevHardness => ({
        ...prevHardness,
        [batchNumber]: "0.00" // Initialize to "0.00" if batchNumber is undefined
      }));
      return; // Exit the function early
    }
  
    // Proceed if batchNumber exists
    Object.entries(userInputs[batchNumber]).forEach(([chemicalId, batches]) => {
      Object.entries(batches).forEach(([batchNo, kg]) => {
        const kgParsed = parseFloat(kg);
        const chemical = chemicalDetails.find(d => d.chemical_raw_material_batch_no === batchNo);
        if (chemical && !isNaN(kgParsed)) {
          totalKg += kgParsed;
          totalHardnessKg += chemical.input_test_hardness * kgParsed;
        }
      });
    });
  
    const newHardness = totalKg > 0 ? totalHardnessKg / totalKg : 0;
    setCurrentHardness(prevHardness => ({
      ...prevHardness,
      [batchNumber]: newHardness.toFixed(2) // Keeping two decimal points for hardness
    }));
  };
  

  // Remove the recalculateHardnessForBatch call from handleUserInputChange
  const handleUserInputChange = async (batchNumber, materialId, batchNo, value) => {
  
    // Update the frontend state as before
    setUserInputs(prevInputs => {
      const updatedInputs = { ...prevInputs };
      if (!updatedInputs[batchNumber]) updatedInputs[batchNumber] = {};
      if (!updatedInputs[batchNumber][materialId]) updatedInputs[batchNumber][materialId] = {};
      updatedInputs[batchNumber][materialId][batchNo] = value;
      return updatedInputs;
    });
  
    // Now, call the backend to update the database
    try {
      const response = await axios.post('http://localhost:5000/update-output-in-popout', {
        daily_material_formula_id: activeMaterialId,
        chemical_raw_material_batch_no: batchNo,
        output_kg: value,
      });
      console.log('Backend response:', response.data);
    } catch (error) {
      console.error('Error updating output information:', error);
    }
  };

  useEffect(() => {
    if (selectedBatchNumber) { // Ensure there is a selected batch number
      recalculateHardnessForBatch(selectedBatchNumber);
    }
  }, [userInputs, selectedBatchNumber, chemicalDetails]); // Dependencies array

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
            onClick={() => handleButtonClick('促進劑領料單')
            }
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
      {/* ${!showNotesDialog && 'justify-center'} */}
      {groupedDataEntries.length > 0 ? (
        <div className={`flex flex-wrap -mx-2 w-full mb-24 ${selectedButton !== '主膠領料單' && 'justify-center'}`}>
          {groupedDataEntries.map(([batchNumber, details]) => {
            const filteredMaterials = details.materials.filter((material) =>
              shouldDisplayMaterial(material.chemical_raw_material_id, selectedButton)
            );

            const disableCalculateButton = details.materials.some(material =>
              shouldDisplayMaterial(material.chemical_raw_material_id, '主膠領料單') && material.collecting_status
            );
  
            return (
              <div key={details.daily_material_formula_id} className="mt-4 p-4 border rounded shadow-sm w-full mx-2 mb-4" style={{maxWidth:"60rem"}}>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">打料單號 {details.order}</h3>
                  <h3 className="text-lg font-medium">機台: {details.production_machine}</h3>
                  <h3 className="text-lg font-medium">{batchNumber}</h3>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <p className="text-lg font-medium">膠料編號: {details.material_id}</p>
                  <p className="text-lg font-medium text-red-600" style={{marginRight:"110px"}}>混合硬度: {currentHardness[batchNumber] || 0}</p>
                  <p className="text-lg">總生產量: {details.total_demand}</p>
                </div>
                {selectedButton === '主膠領料單' && (
                <button
                  disabled={disableCalculateButton}
                  type="button"
                  className="mb-2 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-bold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => handleCalculateOptimalHardness(batchNumber)}
                >
                  計算最佳組合
                </button>
                )}
                <div className="w-full">
                  <table className="min-w-full divide-y divide-gray-200 ">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"105px"}}>化工原料ID</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"100px"}}>化工名稱</th>
                        {selectedButton === '主膠領料單' && (
                          <>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"120px"}}>推薦批號</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"100px"}}>位子</th>
                          </>
                        )}
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"100px"}}>用量/KG</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"50px"}}>是否完成</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" style={{minWidth:"300px"}}>備註</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaterials.length > 0 ? (
                        filteredMaterials.map((material) => {

                          return (
                          <tr key={material.daily_material_formula_id} className={`bg-white ${selectedRowId === material.daily_material_formula_id ? 'bg-yellow-100' : ''}`}>
                            <td className="px-4 py-2 whitespace-nowrap text-md text-gray-500">{material.chemical_raw_material_id}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{material.chemical_raw_material_name}</td>
                            {selectedButton === '主膠領料單' && (
                              <>  
                                {/* recommendedBatchNumber  */}
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{material.rec_chemical_raw_material_batch_no || '無'}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{material.position || '無'}</td>
                              </>
                            )}
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{material.usage_kg}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="checkbox"
                                checked={material.collecting_status}
                                onChange={() => handleCheckboxChange(material.daily_material_formula_id, material.collecting_status)}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              />
                            </td>
                            <td className="flex px-4 py-3 whitespace-nowrap text-gray-700">
                              <textarea
                                  type="text"
                                  value={material.notes}
                                  onChange={(event) => handleNotesInputChange(material.daily_material_formula_id, event.target.value)}
                                  onBlur={(event) => handleNotesChange(material.daily_material_formula_id, event.target.value)}
                                  className="w-full px-2 py-1 border-b border-indigo-300 focus:outline-none focus:border-indigo-500"
                                  placeholder="..."
                                  rows="1"
                                />
                              {selectedButton === '主膠領料單' && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-5 w-10 h-10 text-indigo-600 hover:text-indigo-500 rounded-full p-2 hover:bg-indigo-100" onClick={(event) => handleIconClick(batchNumber, material.chemical_raw_material_id, material.daily_material_formula_id, event)}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>
                              )}
                                {showNotesDialog && (
                                  <div
                                    className="absolute z-50 bg-yellow-100 p-4 rounded shadow-md"
                                    style={{
                                      width: '460px',
                                      top: popOutPosition.y - 25,
                                      left: popOutPosition.x + 56,
                                    }}
                                  >
                                    <table className="min-w-full divide-y divide-gray-300">
                                      <thead>
                                        <tr>
                                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">膠料批號</th>
                                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">位置</th>
                                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">硬度</th>
                                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">剩餘公斤</th>
                                          <th className="relative px-3 py-3 text-sm font-semibold text-gray-900">使用公斤</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {chemicalDetails.map((detail, index) => {
                                          
                                          const isCollectingFinished = groupedData[selectedBatchNumber]?.materials.find(material =>
                                            material.chemical_raw_material_id === detail.chemical_raw_material_id && shouldDisplayMaterial(material.chemical_raw_material_id, '主膠領料單')
                                          )?.collecting_status;
                                          const displayKg = userInputs[selectedBatchNumber]?.[material.chemical_raw_material_id]?.[detail.chemical_raw_material_batch_no] || '';

                                          return (
                                            <tr key={index}>
                                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.chemical_raw_material_batch_no}</td>
                                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.chemical_raw_material_position}</td>
                                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.input_test_hardness}</td>
                                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.batch_kg}</td>
                                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <input
                                                  type="number"
                                                  disabled={isCollectingFinished}
                                                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                  value={displayKg}
                                                  onChange={(e) => {
                                                    // Prevent negative numbers
                                                    const value = Math.max(0, e.target.valueAsNumber);
                                                    handleUserInputChange(selectedBatchNumber, material.chemical_raw_material_id, detail.chemical_raw_material_batch_no, value.toString());
                                                  }}
                                                  placeholder="輸入.."
                                                />
                                              </td>
                                            </tr>
                                          );
                                        })}
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
                          );
                        })
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
