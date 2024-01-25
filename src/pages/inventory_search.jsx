import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

const inventory = [
    { date: '2024/01/01', id: 'DA0124010', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    { date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    {date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    {date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    {date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
  ]
  
const labels = ["化工原料ID","化工原料名稱","目前庫存","功能","單價","安全庫存量"];
const data = ["HB-F0-01-02-D", " TPE", " 60", " 黑", "123", " 通用"];


//-------------------------------------------------------------------------------------------------------------------------------------

export default function InventorySearch() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

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
        endpoint = '/search-materials-by-name'; // Replace with your actual endpoint
        break;
      case 'batchNumber':
        endpoint = '/search-materials-by-batch'; // Replace with your actual endpoint
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


  const openPopover = (inventoryItem) => {
    setSelectedInventory(inventoryItem);
    setIsPopoverOpen(true);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
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
            <div className=" mt-10 px-4 sm:px-6 lg:px-8">  
              <div className="flow-root">
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
                              <tr key={index}>
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
                                    onClick={() => openPopover()}
                                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                  >
                                    出庫紀錄
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9" className="text-center py-4 text-sm text-gray-500">No data found</td>
                            </tr>
                          )}
                          {/* {inventory.map((inventry, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {inventry.date}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.id}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.kg}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.pos}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.company}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.hardness}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.ppl}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.pass}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.company_id}</td>

                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  onClick={() => openPopover(inventry)}
                                  className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                >
                                  出庫紀錄
                                </button>
                              </td>
                            </tr>
                          ))} */}


                          
                      {/* Popover Dialog --------------------------------------------------------------------*/}
                      <Transition.Root show={isPopoverOpen} as={Fragment}>
                            <Dialog as="div" className="relative z-10" onClose={closePopover}>
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

                              <div className="fixed z-10 inset-0 overflow-y-auto">
                                <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                                  <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                  >
                                    <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                              主膠出庫
                                            </Dialog.Title>
                                            <div className="mt-2">
                                              <p className="text-sm text-gray-500">
                                                出庫日期：{selectedInventory?.date}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                出庫公斤：{selectedInventory?.kg}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                          type="button"
                                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                          onClick={() => closePopover()}
                                        >
                                          關閉
                                        </button>
                                      </div>
                                    </Dialog.Panel>
                                  </Transition.Child>
                                </div>
                              </div>
                            </Dialog>
                          </Transition.Root>
                            {/* ------------------------------------------------------------------------------------ */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* {here----------------------------------------------}   */}
          </div>
          


        </div>
    </div>
    
  )
}