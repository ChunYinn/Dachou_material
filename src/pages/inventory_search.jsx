import { Fragment, useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
  
const labels = ["化工原料ID","化工原料名稱","目前庫存","功能","單價","安全庫存量"];

//-------------------------------------------------------------------------------------------------------------------------------------

export default function InventorySearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  //------------------------------------------------
  const [date, setDate] = useState(new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
  const [kilograms, setKilograms] = useState('');
  const [position, setPosition] = useState('');
  const [vendor, setVendor] = useState('');
  const [hardness, setHardness] = useState('');
  const [inspector, setInspector] = useState('');
  const [supplierBatchNumber, setSupplierBatchNumber] = useState('');

  //------------------------------------------------ for batch generation--------------------------------
  const currentDate = new Date();
  const initialSequence = 1; // Start sequence from 1
  const [materialId, setMaterialId] = useState("Undefined");
  const [sequence, setSequence] = useState(initialSequence);
  const [batchNumberForImport, setBatchNumber] = useState("");
  const [chemicalIndividualInput, setChemicalIndividualInput] = useState([]);

  // Moved inside the component to access state directly
  const generateBatchNumber = (materialId, date, sequence) => {
    const year = date.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month with leading zero
    const day = date.getDate().toString().padStart(2, '0'); // Day with leading zero
    const formattedSequence = sequence.toString().padStart(2, '0'); // Ensure sequence is two digits
    const generatedBatchNumber = `${materialId}${year}${month}${day}${formattedSequence}`;

    if (!chemicalIndividualInput.some(item => item.chemical_raw_material_batch_no === generatedBatchNumber)) {
      return generatedBatchNumber;
    } else {
      return generateBatchNumber(materialId, date, sequence + 1);
    }
  };

  useEffect(() => {
    // Check if there are valid searchResults for chemicalStocksAndInfo
    if (searchResults.chemicalStocksAndInfo && searchResults.chemicalStocksAndInfo.length > 0) {
      // Update materialId based on the first item in the chemicalStocksAndInfo array
      const materialId = searchResults.chemicalStocksAndInfo[0].chemical_raw_material_id;
      setMaterialId(materialId);
    } else {
      // Optionally reset materialId if no valid chemicalStocksAndInfo is found
      setMaterialId("Undefined");
    }
  
    // Update chemicalIndividualInput based on the presence of chemicalIndividualInput in searchResults
    if (searchResults.chemicalIndividualInput && searchResults.chemicalIndividualInput.length > 0) {
      setChemicalIndividualInput(searchResults.chemicalIndividualInput);
    } else {
      // Reset to an empty array if there are no chemicalIndividualInput results
      setChemicalIndividualInput([]);
    }
  }, [searchResults]); // Reacts to changes in searchResults
  

  useEffect(() => {
    // This effect will re-run whenever materialId or sequence changes
    const generatedBatchNumber = generateBatchNumber(materialId, currentDate, sequence);
    console.log('batch number: use effect hook', generatedBatchNumber);
    setBatchNumber(generatedBatchNumber);
    // Consider if you really need to increment sequence here, or if it should be done only under certain conditions
  }, [materialId, sequence]);

  // Logic to handle generating new batch number on specific actions (e.g., user clicks a button)
  const incrementSequenceAndGenerateBatchNumber = () => {
    setSequence(prevSequence => prevSequence + 1);
  };

  useEffect(() => {
    // Generating currentDate within useEffect to ensure it's updated
    const currentDate = new Date();
    const generateAndSetBatchNumber = () => {
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      let tempSequence = sequence;
      let newBatchNumber;

      do {
        const formattedSequence = tempSequence.toString().padStart(2, '0');
        newBatchNumber = `${materialId}${year}${month}${day}${formattedSequence}`;
        tempSequence++;
      } while (chemicalIndividualInput.some(item => item.chemical_raw_material_batch_no === newBatchNumber));

      // If the sequence was incremented, update it in state
      if (tempSequence !== sequence) {
        setSequence(tempSequence - 1); // Adjust because tempSequence was incremented one extra time
      }

      console.log('new batch: ', newBatchNumber);
      setBatchNumber(newBatchNumber);
    };

    generateAndSetBatchNumber();
  }, [materialId, sequence, chemicalIndividualInput]);

  //-------------------------------------------------------------------------------------------------------------------------------------------
  // State for managing dialog visibility
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedBatchNo, setSelectedBatchNo] = useState('');
  const [selectedUsageKgRemain, setselectedUsageKgRemain] = useState('');

  const toggleExportDialog = () => {
    setIsExportDialogOpen(!isExportDialogOpen);
  };

  const handleExportButtonClick = (batchNo, RemainKg) => {
    setSelectedBatchNo(batchNo);
    setselectedUsageKgRemain(RemainKg);
    toggleExportDialog();
  };

  // Function to handle the submission of export data from the ExportDialog
  const onExportSubmit = async (exportData) => {
    try {
      const response = await axios.post('http://localhost:5000/export-chemical-material', exportData);
      
      if (response.status === 200) {
        alert('Export successful!');
        setIsExportDialogOpen(false); // Assuming you have this state in your component
      } else {
        alert('Export failed! Please try again.');
      }
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Export failed due to an error.');
    }
  };
  //------------------------------------------------

  const transformDataForTable = () => {
    if (searchResults.chemicalStocksAndInfo && searchResults.chemicalStocksAndInfo.length > 0) {
      const info = searchResults.chemicalStocksAndInfo[0];
      return [
        info.chemical_raw_material_id,
        info.chemical_raw_material_name,
        info.chemical_raw_material_current_stock,
        info.material_function,
        info.unit_price,
        info.safty_stock_value,
      ];
    }
    return [];
  };

  const tableData = transformDataForTable();

  // State for input fields
  const [inputFields, setInputFields] = useState({
    chemicalId: '',
    chemicalName: '',
    batchNumber: '',
  });

  const fetchMaterials = async (field, value) => {
    if (!value) return; // Do not fetch if the value is empty
  
    let endpoint;
    switch (field) {
      case 'chemicalId':
        endpoint = '/search-materials-by-id';
        break;
      case 'chemicalName':
        endpoint = '/search-materials-by-name';
        break;
      case 'batchNumber':
        endpoint = '/search-materials-by-batch'; 
        break;
      default:
        return;
    }
  
    try {
      const response = await axios.get(`http://localhost:5000${endpoint}`, {
        params: { [field]: value }
      });
      setSearchResults(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error appropriately
    }
  };
  
  const handleInputChange = (field, value) => {
    // Clear other fields and set the current field
    setInputFields({
      chemicalId: '',
      chemicalName: '',
      batchNumber: '',
      [field]: value,
    });
  };

  const handleSearch = () => {
    setExportHistory([]);
    setSelectedRowIndex(null);
    
    if (inputFields.chemicalId) {
      fetchMaterials('chemicalId', inputFields.chemicalId);
    } else if (inputFields.chemicalName) {
      fetchMaterials('chemicalName', inputFields.chemicalName);
    } else if (inputFields.batchNumber) {
      fetchMaterials('batchNumber', inputFields.batchNumber);
    }
  };

  const handleRowClick = async (batchNo, index) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-export-history/${batchNo}`);
      setExportHistory(response.data); // Update the export history state
      setSelectedRowIndex(index); // Update the selected row index state
    } catch (error) {
      console.error('Error fetching export history:', error);
    }
  };

  const handleNewImportSubmit = async () => {
    if (!kilograms || !position || !vendor || !hardness || !inspector || !supplierBatchNumber) {
      alert("Please fill in all fields before submitting.");
      return;
    }
  
    // Construct the importData object with the current batch number
    const importData = {
      input_date: date,
      chemical_raw_material_batch_no: batchNumberForImport,
      chemical_raw_material_id: materialId,
      chemical_raw_material_input_kg: kilograms,
      chemical_raw_material_position: position,
      chemical_raw_material_supplier: vendor,
      input_test_hardness: hardness,
      test_employee: inspector,
      supplier_material_batch_no: supplierBatchNumber,
      batch_kg: kilograms,
    };
  
    try {
      await axios.post('http://localhost:5000/add-chemical-import', importData);
      alert("Import data submitted successfully.");
      
      // Reset input fields
      setKilograms('');
      setPosition('');
      setVendor('');
      setHardness('');
      setInspector('');
      setSupplierBatchNumber('');
  
      incrementSequenceAndGenerateBatchNumber();

    } catch (error) {
      console.error('Error submitting new import data:', error);
      alert("Failed to submit import data.");
    }
  };
  

  return (
    <div className="flex justify-center items-center mt-14">

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-4xl mb-4 font-semibold leading-6 text-gray-900">化工原料庫存單項</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-4">
        
            <div className="relative">
              <label
                  htmlFor="name"
                  className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                >
                  化工原料ID
                </label>
              <input
                type="text"
                name="chemicalId"
                id="chemicalId"
                value={inputFields.chemicalId}
                onChange={(e) => handleInputChange('chemicalId', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="DH10"
              />
            </div>
            {/* Chemical Name Input */}
            <div className="relative">
              <label
                  htmlFor="name"
                  className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                >
                  化工名稱
                </label>
              <input
                type="text"
                name="chemicalName"
                id="chemicalName"
                value={inputFields.chemicalName}
                onChange={(e) => handleInputChange('chemicalName', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="AN-300"
              />
            </div>
            {/* Batch Number Input */}
            <div className="relative">
              <label
                  htmlFor="name"
                  className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                >
                  批號
                </label>
              <input
                type="text"
                name="batchNumber"
                id="batchNumber"
                value={inputFields.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="AN123123"
              />
            </div>
              <button
                type="button"
                onClick={handleSearch}
                className="block w-16 rounded-md bg-indigo-700 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
              >
                搜尋
              </button>
            </div>
          </div>

          <div className="flex flex-col mt-10">            
            {/* Top table showing material basic info ------------------- */}
            <div className="mt-2 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap p-5 bg-white rounded-lg shadow-lg ring-1 ring-gray-300">
                {labels.map((label, index) => (
                  <div className="flex items-center mb-4 md:mb-0 md:w-1/3" key={label}>
                    <div className="mr-4">
                      <label className="text-sm font-bold leading-6 text-gray-900">
                        {label}:
                      </label>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-700">
                        {tableData[index] || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* formula table ----------------------------------------------*/}
            <div className="mt-12 flex">  
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">入庫記錄</h2>
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '35vh', overflowY: 'auto' }}>
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              入庫日期
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              批號
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              公斤
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              位子
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              廠商
                            </th> 
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              硬度
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              檢測人員
                            </th> 
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              合格
                            </th> 
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              廠商批號
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <span className="sr-only">export</span>
                            </th> 
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Edit</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {searchResults.chemicalIndividualInput && searchResults.chemicalIndividualInput.length > 0 ? (
                            searchResults.chemicalIndividualInput.map((input, index) => (
                              <tr 
                                key={index}
                                className={index === selectedRowIndex ? "bg-yellow-100" : ""}
                              >
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {input.formatted_input_date} {/* Format this date as needed */}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.chemical_raw_material_batch_no}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.batch_kg}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.chemical_raw_material_position}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.chemical_raw_material_supplier}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.input_test_hardness}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.test_employee}</td>
                                <td className={`whitespace-nowrap px-3 py-4 text-sm ${input.quality_check === 1 ? 'text-green-600' : 'text-red-500'}`}>
                                  {input.quality_check === 1 ? '合格' : '不合格'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.supplier_material_batch_no}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 text-right text-sm font-medium sm:pr-6">
                                  <button
                                    onClick={() => handleExportButtonClick(input.chemical_raw_material_batch_no, input.batch_kg)}
                                    className="text-red-600 hover:text-red-900 hover:underline"
                                  >
                                    出庫
                                  </button>
                                </td>
                                <td className="relative whitespace-nowrap py-4 pr-4 text-right text-sm font-medium sm:pr-6">
                                  <button
                                    onClick={() => handleRowClick(input.chemical_raw_material_batch_no, index)}
                                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                  >
                                    出庫紀錄
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9" className="text-center py-4 text-sm text-gray-500">無資料</td>
                            </tr>
                          )}
                        </tbody>
                      </table>                     
                    </div>
                  </div>
                </div>
              </div>

              
              {/* Place this outside your table or list rendering so it's only included once in your component */}
              <ExportDialog
                open={isExportDialogOpen}
                onClose={toggleExportDialog}
                batchNo={selectedBatchNo}
                kgRemain={selectedUsageKgRemain}
                onExportSubmit={onExportSubmit}
              />
              
              {/* ------------------------------------------------------------------------------------ */}
              <div className="flex-grow-0 w-1/8 ml-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">出庫記錄</h2>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '35vh', overflowY: 'auto' }}>
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          出庫日期
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-gray-900">
                          公斤
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-gray-900">
                          用途
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {exportHistory.length > 0 ? (
                        exportHistory.map((entry, index) => (
                          <tr key={index} className='bg-yellow-100'>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {entry.formatted_collect_date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.chemical_raw_material_output_kg}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.output_usage}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4 text-sm text-gray-500">無資料</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {searchResults?.chemicalStocksAndInfo?.length > 0 && (
            <>
            {/* Divider */}
            <div className="mt-12 mb-4 w-full border-t border-gray-200"></div>
            {/* {here---------------input group for add new import-------------------------------}   */}
            <div className="flex flex-col w-full mb-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">新增入庫</h2>

              
              <div className="flex gap-3">
                {/* Date */}
                <div className="relative">
                  <label
                      htmlFor="date"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      入庫日期
                  </label>
                  <input
                    type="text"
                    name="date"
                    id="date"
                    value={date}
                    readOnly
                    className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    style={{ width: '7rem' }}
                  />
                </div>
                {/* batch number */}
                <div className="relative">
                  <label
                      htmlFor="name"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      批號
                    </label>
                  <input
                    type="text"
                    name="batchNumber"
                    id="batchNumber"
                    value={batchNumberForImport}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=""
                    readOnly
                  />
                </div>
                {/* Input field for Kilograms */}
                <div className="relative">
                  <label
                      htmlFor="kilograms"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      公斤
                  </label>
                  <input
                    type="text"
                    name="kilograms"
                    id="kilograms"
                    value={kilograms}
                    onChange={(e) => setKilograms(e.target.value)}
                    className="block w-16 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=""
                  />
                </div>

                {/* Input field for Position */}
                <div className="relative">
                  <label
                      htmlFor="position"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      位子
                  </label>
                  <input
                    type="text"
                    name="position"
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="block w-16 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=""
                  />
                </div>

                {/* Input field for Vendor */}
                <div className="relative">
                  <label
                      htmlFor="vendor"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      廠商
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    id="vendor"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=""
                    style={{ width: '5rem' }}
                  />
                </div>

                {/* Input field for Hardness */}
                <div className="relative">
                  <label
                      htmlFor="hardness"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      硬度
                  </label>
                  <input
                    type="text"
                    name="hardness"
                    id="hardness"
                    value={hardness}
                    onChange={(e) => setHardness(e.target.value)}
                    className="block w-16 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=""
                  />
                </div>

                {/* Input field for Inspector */}
                <div className="relative">
                  <label
                      htmlFor="inspector"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      檢測人員
                  </label>
                  <input
                    type="text"
                    name="inspector"
                    id="inspector"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=""
                    style={{ width: '7rem' }}
                  />
                </div>
                {/* Input field for Supplier Batch Number */}
                <div className="relative">
                  <label
                      htmlFor="supplierBatchNumber"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                    >
                      廠商批號
                  </label>
                  <input
                    type="text"
                    name="supplierBatchNumber"
                    id="supplierBatchNumber"
                    value={supplierBatchNumber}
                    onChange={(e) => setSupplierBatchNumber(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=""
                    style={{ width: '7rem' }}
                  />
                </div>
                
                <button
                  type="button"
                  className="ml-6 inline-flex items-center justify-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                  onClick={handleNewImportSubmit}
                >
                  <svg className="mr-2 -ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新增
                </button>
              </div>
              

            </div> 
            </>
            
            )}
            
            {/* {here---------------input group for add new import-------------------------------}   */}
          </div>
        </div>
    </div>
    
  )
}

export function ExportDialog({ open, onClose, batchNo, kgRemain, onExportSubmit }) {
  const [kilograms, setKilograms] = useState('');
  const [purpose, setPurpose] = useState('');

  // Handle the submission of export data
  const handleSubmit = () => {
    // Validate input here if necessary
    if (!kilograms || !purpose) {
      alert("請填寫全部");
      return;
    } else if (parseFloat(kilograms) > parseFloat(kgRemain)) {
      alert("出庫公斤數不可大於剩餘公斤數");
      return;
    }

    const today= new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')

    // Prepare the data to be submitted
    const exportData = { today, batchNo, kilograms, purpose };

    // Call the provided onExportSubmit function to handle the export data
    onExportSubmit(exportData);

    // Optionally reset the form fields
    setKilograms('');
    setPurpose('');

    // Close the dialog
    onClose(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                {/* Content */}
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-bold text-gray-900">
                    原物料出庫: {batchNo}
                  </Dialog.Title>

                  {/* Input Fields */}
                  <div className="mt-4">
                    <label htmlFor="exportKG" className="block text-sm font-medium text-gray-700">
                        出庫 (剩餘公斤: <span style={{ color: 'red' }}>{kgRemain}</span>)
                    </label>
                    <input
                      type="number"
                      name="kg_usage"
                      id="export_kg_usage"
                      value={kilograms}
                      onChange={(e) => setKilograms(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder=""
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="exportPurpose" className="block text-sm font-medium text-gray-700">
                      用途
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      id="export_purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleSubmit}
                  >
                    送出
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => onClose(false)}
                  >
                    取消
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}