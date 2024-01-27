import { useState } from 'react';
import axios from 'axios';
  
const labels = ["化工原料ID","化工原料名稱","目前庫存","功能","單價","安全庫存量"];

//-------------------------------------------------------------------------------------------------------------------------------------

export default function InventorySearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

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
  

  return (
    <div className="flex justify-center items-center mt-14">

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-4xl mb-4 font-semibold leading-6 text-gray-900">化工原料庫存管理</h1>
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
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
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
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.chemical_raw_material_input_kg}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.chemical_raw_material_position}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.chemical_raw_material_supplier}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.input_test_hardness}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.test_employee}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.quality_check}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{input.supplier_material_batch_no}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
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
              
              {/* ------------------------------------------------------------------------------------ */}
              <div className="flex-grow-0 w-1/5 ml-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">出庫記錄</h2>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          出庫日期
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-gray-900">
                          公斤
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {exportHistory.length > 0 ? (
                        exportHistory.map((entry, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {entry.formatted_collect_date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.chemical_raw_material_output_kg}</td>
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
            {/* {here----------------------------------------------}   */}
          </div>
          


        </div>
    </div>
    
  )
}