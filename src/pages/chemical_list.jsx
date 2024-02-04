import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import '../../src/index.css'

export default function ChemicalList() {
  const navigate = useNavigate();
  // State for filters
  const [idFilter, setIDFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [restockFilter, setRestockFilter] = useState('');


  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chemicals, setChemicals] = useState([]); // State to store the chemicals
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Function to fetch chemicals
  const fetchChemicals = () => {
    axios.get('http://localhost:5000/get-chemicals')
      .then(response => {
        setChemicals(response.data); // Set the chemicals in state
      })
      .catch(error => {
        console.error("Error fetching chemicals", error);
      });
  };

  useEffect(() => {
    fetchChemicals(); // Fetch chemicals when the component mounts
  }, []);

  // Function to handle adding new material
  const handleAddClick = (assignmentData) => {
    axios.post('http://localhost:5000/assign-material', assignmentData)
      .then(response => {
        fetchChemicals();
        setIsDialogOpen(false);
      })
      .catch(error => {
        console.error("Error submitting data", error);
      });
  };
  

  // Function to handle deleting a material
  const handleDelete = (materialId) => {
    axios.delete(`http://localhost:5000/delete-material/${materialId}`)
      .then(() => {
        fetchChemicals(); // Fetch the updated list of materials
        console.log('Material deleted!');
      })
      .catch(error => {
        console.error("Error deleting material", error);
      });
  };

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
    
    // Reset states when closing the dialog
    if (isDialogOpen) {
      setEditingMaterial(null); // Clear editing material
      // Reset other states if necessary
    }
  };
  

  //-----update function------
  const handleEditClick = async (materialId) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-material/${materialId}`);
      setEditingMaterial(response.data);
      console.log(response.data);
      toggleDialog();
    } catch (error) {
      console.error("Error fetching material details", error);
    }
  };

  const handleUpdateClick = (assignmentData) => {
    axios.put(`http://localhost:5000/update-material/${editingMaterial.material_assign_id}`, assignmentData)
      .then(() => {
        fetchChemicals();
        setIsDialogOpen(false);
        setEditingMaterial(null); // Reset editing material
      })
      .catch(error => {
        console.error("Error updating material", error);
      });
  };


  //--filter function
  // Function to handle filter change for date
  const handleIDFilterChange = (e) => {
    setIDFilter(e.target.value);
  };

  // Function to handle filter change for glue ID
  const handleNameFilterChange = (e) => {
    setNameFilter(e.target.value);
  };

  const handleRestockFilterChange = (e) => {
    setRestockFilter(e.target.value);
  };
  

  // Filtered materials
  const filteredChemicals = chemicals.filter((chemical) => {
    const restockMatch = restockFilter ? 
    chemical.need_restock === (restockFilter.toUpperCase() === 'YES' ? 1 : 0) : true;
    return (
        chemical.chemical_raw_material_id.includes(idFilter) &&
        chemical.chemical_raw_material_name.includes(nameFilter) &&
        restockMatch
    );
  });

  return (
    
    <div className="flex justify-center items-center mt-14">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-semibold leading-6 text-gray-900">化工原料庫存總表</h1>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-4">
            <button
              type="button"
              className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={toggleDialog}
            >
              +新增
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-7 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '60vh', overflowY: 'auto' }} >
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 sm:pl-6" style={{width: "15%"}}>
                        <div className="flex items-center">
                          化工原料ID
                        </div>
                        <input type="text" value={idFilter} onChange={handleIDFilterChange} className="mt-2 w-32 block h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: 01-01"/>
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900" style={{width: "15%"}}>
                        <div className="flex items-center">
                          化工原料名稱
                        </div>
                        <input type="text" value={nameFilter} onChange={handleNameFilterChange} 
                        className="w-32 mt-2 block h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: AN-550"/>
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900">
                        目前庫存
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900">
                        安全庫存量
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900">
                        合格庫存
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900">
                        不合格庫存
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900" style={{width: "12%"}}>
                        需補貨
                        <input
                          type="text"
                          value={restockFilter}
                          onChange={handleRestockFilterChange}
                          className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                          placeholder="YES/NO"
                        />
                      </th>

                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <span className="sr-only">update</span>
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredChemicals.length > 0 ? (
                      filteredChemicals.map((chemical) => (
                        <tr key={chemical.chemical_raw_material_id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3  text-gray-500 sm:pl-6">
                          {chemical.chemical_raw_material_id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_current_stock}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.safty_stock_value}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.ok_kg}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.ng_kg}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {/* Conditional rendering for 需補貨 */}
                            {chemical.need_restock === 1 ? (
                              <span className="text-red-600">YES</span>
                            ) : (
                              <span className="text-gray-400">NO</span>
                            )}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium">
                            <button className="text-yellow-600 hover:text-yellow-900 font-bold" onClick={() => handleEditClick(chemical.material_assign_id)}>
                              編輯
                            </button>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium">
                            <button className="text-red-600 hover:text-red-900 font-bold" onClick={() => handleDelete(chemical.material_assign_id)}>
                              刪除
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="100%" className="text-center align-middle py-10"> {/* Use 100% to span all columns */}
                          <p className="text-lg text-gray-500 h-10">無資料</p>
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <DialogComponent
          isOpen={isDialogOpen}
          onClose={toggleDialog}
          onSubmit={editingMaterial ? handleUpdateClick : handleAddClick}
          editingMaterial={editingMaterial}
        />
      )}
    </div>
    
  )
}

function DialogComponent({ isOpen, onClose, onSubmit, editingMaterial }) {
    const [chemicalRawMaterialId, setChemicalRawMaterialId] = useState('');
    const [chemicalRawMaterialName, setChemicalRawMaterialName] = useState('');
    const [materialFunction, setMaterialFunction] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [safetyStockValue, setSafetyStockValue] = useState('');
  
    useEffect(() => {
      if (editingMaterial) {
        // Set the state for the fields from the editingMaterial if available
        setChemicalRawMaterialId(editingMaterial.chemical_raw_material_id);
        setChemicalRawMaterialName(editingMaterial.chemical_raw_material_name);
        setMaterialFunction(editingMaterial.material_function);
        setUnitPrice(editingMaterial.unit_price);
        setSafetyStockValue(editingMaterial.safety_stock_value);
      } else {
        // Reset the fields when not editing an existing material
        setChemicalRawMaterialId('');
        setChemicalRawMaterialName('');
        setMaterialFunction('');
        setUnitPrice('');
        setSafetyStockValue('');
      }
    }, [editingMaterial]);
  
    const prepareDataAndSubmit = () => {
      if (!chemicalRawMaterialId || !chemicalRawMaterialName || !safetyStockValue) {
        alert("請填寫化工原料ID,名稱和安全庫存量");
        return;
      }
  
      const assignmentData = {
        chemical_raw_material_id: chemicalRawMaterialId,
        chemical_raw_material_name: chemicalRawMaterialName,
        material_function: materialFunction,
        unit_price: unitPrice,
        safety_stock_value: safetyStockValue,
      };
  
      onSubmit(assignmentData);
    };
  
  // Create a custom theme
  const newTheme = createTheme({
    components: {
      // Your custom overrides
      MuiPickersToolbar: {
        styleOverrides: {
          root: {
            color: '#1565c0',
            borderRadius: 2,
            borderWidth: 1,
            borderColor: '#2196f3',
            border: '1px solid',
            backgroundColor: '#bbdefb',
          },
        },
      },
      // Add other component overrides if needed
    },
  });

  //date formatting
  function convertToTaiwanDate(dateString) {
    // Create a new Date object from the input string and add 8 hours for Taiwan time
    const date = new Date(dateString);
    date.setHours(date.getHours() + 8);
  
    // Format the date in yyyy-mm-dd format
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={() => onClose()}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                      新增化工原料
                    </Dialog.Title>
                    <div className="mt-9">
                      {/* Chemical Raw Material ID Field */}
                      <label htmlFor="chemical_raw_material_id" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                        化工原料ID
                      </label>
                      <input
                        type="text"
                        id="chemical_raw_material_id"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="輸入ID"
                        value={chemicalRawMaterialId}
                        onChange={(e) => setChemicalRawMaterialId(e.target.value)}
                        />


                      {/* Chemical Raw Material Name Field */}
                      <label htmlFor="chemical_raw_material_name" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                        化工原料名稱
                      </label>
                      <input
                        type="text"
                        id="chemical_raw_material_name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="輸入名稱"
                        value={chemicalRawMaterialName}
                        onChange={(e) => setChemicalRawMaterialName(e.target.value)}
                      />

                      {/* Material Function Field */}
                      <label htmlFor="material_function" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                        化工原料功能
                      </label>
                      <input
                        type="text"
                        id="material_function"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="輸入功能"
                        value={materialFunction}
                        onChange={(e) => setMaterialFunction(e.target.value)}
                      />

                      {/* Unit Price Field */}
                      <label htmlFor="unit_price" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                        單價
                      </label>
                      <input
                        type="number"
                        id="unit_price"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="輸入每公斤單價"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                      />

                      {/* Safety Stock Value Field */}
                      <label htmlFor="safety_stock_value" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                        安全庫存量
                      </label>
                      <input
                        type="number"
                        id="safety_stock_value"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="輸入安全庫存公斤數"
                        value={safetyStockValue}
                        onChange={(e) => setSafetyStockValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={prepareDataAndSubmit}
                  >
                    {editingMaterial ? '更改' : '新增'}
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

