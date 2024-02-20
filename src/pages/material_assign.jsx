import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CalendarIcon } from '@heroicons/react/20/solid'; 
import '../../src/index.css'

export default function MaterialAssign() {
  const navigate = useNavigate();
  // State for filters
  const [dateFilter, setDateFilter] = useState('');
  const [glueIdFilter, setGlueIdFilter] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [materials, setMaterials] = useState([]); // State to store the materials
  const [editingMaterial, setEditingMaterial] = useState(null);

  // State to store stock status of each material assignment
  const [stockStatus, setStockStatus] = useState({});
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [chemicalDetails, setChemicalDetails] = useState([]); // This will store the insufficient stock details
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [popOutPosition, setPopOutPosition] = useState({ x: 0, y: 0 });


  // Function to fetch materials
  const fetchMaterials = () => {
    axios.get('http://localhost:5000/get-materials')
      .then(response => {
        setMaterials(response.data); // Set the materials in state
      })
      .catch(error => {
        console.error("Error fetching materials", error);
      });
  };

  useEffect(() => {
    fetchMaterials(); // Fetch materials when the component mounts
  }, []);
  useEffect(() => {
    // Fetch stock status for each material after the materials have been fetched and set
    materials.forEach(material => {
      fetchStockStatus(material.material_assign_id);
    });
  }, [materials]); // Depend on 'materials' to re-run this effect when materials array updates


// Function to fetch stock status for a given material assignment
const fetchStockStatus = (materialAssignId) => {
  axios.get(`http://localhost:5000/material-stock-status/${materialAssignId}`)
    .then(response => {
      // Update the stockStatus state with the new data
      setStockStatus(prevState => ({
        ...prevState,
        [materialAssignId]: response.data
      }));
    })
    .catch(error => {
      console.error("Error fetching stock status", error);
    });
};
// Function to show the dialog with insufficient stock details
const handleInsufficientStockClick = async (materialAssignId, event) => {
  setSelectedRowId(materialAssignId); // Now properly defined
  const iconRect = event.currentTarget.getBoundingClientRect();
  setPopOutPosition({ // Now properly defined
    x: iconRect.left + window.scrollX,
    y: iconRect.top + window.scrollY,
  });
  setShowNotesDialog(true);

  try {
    const response = await axios.get(`http://localhost:5000/material-stock-status/${materialAssignId}`);
    if (!response.data.isStockEnough) {
      setChemicalDetails(response.data.insufficientStockDetails);
    } else {
      closeNotesDialog(); // Now properly defined
    }
  } catch (error) {
    console.error('Error fetching insufficient stock details:', error);
    setChemicalDetails([]);
  }
};


const closeNotesDialog = () => {
  setShowNotesDialog(false);
  setSelectedRowId(null); // Reset selected row ID when closing the dialog
  // Reset other states if necessary
};



  // Function to handle adding new material
  const handleAddClick = (assignmentData) => {
    axios.post('http://localhost:5000/assign-material', assignmentData)
      .then(response => {
        fetchMaterials();
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
        fetchMaterials(); // Fetch the updated list of materials
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
        fetchMaterials();
        setIsDialogOpen(false);
        setEditingMaterial(null); // Reset editing material
      })
      .catch(error => {
        console.error("Error updating material", error);
      });
  };


  //--filter function
  // Function to handle filter change for date
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Function to handle filter change for glue ID
  const handleGlueIdFilterChange = (e) => {
    setGlueIdFilter(e.target.value);
  };

  // Filtered materials
  const filteredMaterials = materials.filter((material) => {
    return (
      material.production_date.includes(dateFilter) &&
      material.material_id.includes(glueIdFilter)
    );
  });

  const [latestTotalDemand, setLatestTotalDemand] = useState({
    production_date: '',
    total_demand_sum: 0
  });

  useEffect(() => {
    // Function to fetch the latest total demand data from the server
    const fetchLatestTotalDemand = () => {
      axios.get('http://localhost:5000/get-latest-total-demand')
        .then(response => {
          // Assuming the response data has the structure { production_date: 'date', total_demand_sum: 'sum' }
          // Create a Date object from the production_date
          const dateObj = new Date(response.data.production_date);

          // Format the date as MM-YY
          const formattedDate = `${('0' + (dateObj.getMonth() + 1)).slice(-2)}-${('0' + dateObj.getDate()).slice(-2)}`;
          setLatestTotalDemand({
            production_date: formattedDate,
            total_demand_sum: response.data.total_demand_sum
          });
        })
        .catch(error => {
          console.error('Error fetching latest total demand:', error);
          // Optionally handle errors, such as setting an error state or displaying a message
        });
    };

    // Call the fetch function when the component mounts
    fetchLatestTotalDemand();
  }, []); // The empty dependency array ensures this effect runs only once after the initial render

  return (
    
    <div className="flex justify-center items-center mt-14">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-semibold leading-6 text-gray-900">領料單輸入</h1>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-4">
          <button
              type="button"
              className="block rounded-md bg-gray-400 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {latestTotalDemand.production_date} 總公斤 {latestTotalDemand.total_demand_sum} kg
            </button>
            <button
              type="button"
              className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={toggleDialog}
            >
              +新增
            </button>
            <button
              type="button"
              className="block w-32 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => navigate('/daily-collect')}
            >
              領料單查看
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '60vh', overflowY: 'auto' }} >
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 sm:pl-6" style={{width: "25%"}}>
                        <div className="flex items-center"> {/* Flex container */}
                          打料日期
                          <CalendarIcon className="inline h-5 w-5 ml-2" />
                        </div>
                        <input type="text" value={dateFilter} onChange={handleDateFilterChange} className="mt-2 w-1/2 h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: 01-01"/> {/* Adjusted width */}
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900" style={{width: "25%"}}>
                        <div className="flex items-center"> {/* Flex container */}
                          膠料編號
                        </div>
                        <input type="text" value={glueIdFilter} onChange={handleGlueIdFilterChange} 
                        className="mt-2 w-1/2 h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: AN-550"/>
                        
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900">
                        總需求量
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900">
                        打料順序
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-md font-semibold text-gray-900">
                        機台
                      </th>
                      <th scope="col" className="w-5 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        <span className="sr-only">update</span>
                      </th>
                      <th scope="col" className="relative w-5 py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredMaterials.length > 0 ? (
                      filteredMaterials.map((material) => (
                        <tr key={material.material_assign_id} className={`h-14`}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3  text-gray-500 sm:pl-6">
                            {material.production_date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{material.material_id}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{material.total_demand}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{material.production_sequence}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{material.production_machine}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium">
                            <button className="text-yellow-600 hover:text-yellow-900 font-bold" onClick={() => handleEditClick(material.material_assign_id)}>
                              編輯
                            </button>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium">
                            <button className="text-red-600 hover:text-red-900 font-bold" onClick={() => handleDelete(material.material_assign_id)}>
                              刪除
                            </button>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium">
                          {
                            // Check if production_date is from yesterday or earlier
                            new Date(material.production_date) < new Date(new Date().setDate(new Date().getDate() - 1))
                            ? <span className="text-gray-600 font-bold">歷史紀錄</span> // Display "歷史紀錄" for past records
                            : stockStatus[material.material_assign_id] // Check stock status for current and future records
                              ? (
                                  stockStatus[material.material_assign_id].isStockEnough
                                  ? <span className="text-green-600 font-bold">原料充足</span>
                                  : <button className="text-blue-600 hover:text-blue-900 font-bold" onClick={(event) => handleInsufficientStockClick(material.material_assign_id, event)}>原料不足</button>
                                )
                              : <span>Loading...</span> // Show a loading state while stock status is being fetched
                          }
                            {showNotesDialog && (
                                <div
                                className="fixed inset-0 z-10 overflow-y-auto"
                                style={{
                                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                }}
                              >
                                <div className="flex items-center justify-center min-h-screen">
                                  <div
                                    className="bg-white p-5 rounded-lg shadow-lg max-w-lg mx-auto"
                                    style={{
                                      top: popOutPosition.y + 'px', // Now properly defined
                                      left: popOutPosition.x + 'px', // Now properly defined
                                    }}
                                  >
                                  <table className="min-w-full divide-y divide-gray-300">
                                    {/* Adjust table headers based on your data structure */}
                                    <thead>
                                      <tr>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">化工原料 ID</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">化工原料 名稱</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">需使用公斤數</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">目前公斤數-預計打料</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {chemicalDetails.map((detail, index) => (
                                        <tr key={index}>
                                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.chemical_raw_material_id}</td>
                                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.chemical_raw_material_name}</td>
                                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.usage_kg}</td>
                                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{detail.effective_stock}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="mt-4 flex justify-end">
                              <button
                                onClick={closeNotesDialog} // Now properly defined
                                className="..."
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [glueId, setGlueId] = useState('');
  const [demand, setDemand] = useState('');
  const [order, setOrder] = useState('');
  const [location, setLocation] = useState('內');
  const [materialIDSuggestions, setMaterialIDSuggestions] = useState([]);


  const generateBatchNumber = (date, sequence) => {
    const year = date.format('YY'); // Last two digits of the year
    const monthDay = date.format('MMDD'); // Month and day
    const formattedSequence = sequence.padStart(2, '0'); // Ensure sequence is two digits
    return `${year}${monthDay}-${formattedSequence}`;
  };

  useEffect(() => {
    if (!editingMaterial) {
      setSelectedDate(null); // Reset date when adding a new material
      setGlueId('');
      setDemand('');
      setOrder('');
      setLocation('內');
    } else {
      // Set states for editing material
      setGlueId(editingMaterial.material_id);
      setDemand(editingMaterial.total_demand);
      setOrder(editingMaterial.production_sequence);
      setLocation(editingMaterial.production_machine);
    }
  }, [editingMaterial]);
  

  const prepareDataAndSubmit = async () => {
    if (!glueId || !demand || !order || !location) {
      alert("請填寫全部..");
      return;
    }
  
    // Convert selectedDate to the correct format if necessary
    const formattedDate = selectedDate.add(8, 'hour').format('YYYY-MM-DD');
  
    // First try-catch to check for the material existence
    try {
      const materialResponse = await axios.get(`http://localhost:5000/check-material-exists/${glueId}`);
      if (!materialResponse.data.exists) {
        alert("無此膠料 請先到膠料基本檔建立新膠料");
        return;
      }
    } catch (error) {
      console.error('Error checking material existence:', error);
      // Handle error appropriately
      return;
    }
  
    // Second try-catch to check for the sequence existence
    try {
      const sequenceResponse = await axios.get(`http://localhost:5000/check-sequence-exists/${formattedDate}/${order}`);
      if (sequenceResponse.data.exists) {
        alert("同天不能有重複的打料順序");
        return;
      }
      // Continue with assignment submission...
    } catch (error) {
      console.error('Error checking sequence existence:', error);
      // Handle error appropriately
      return;
    }
  
    // If all checks pass, then proceed to submit the data
    try {
      const assignmentData = {
        production_date: formattedDate,
        material_id: glueId,
        total_demand: demand,
        production_sequence: order,
        production_machine: location,
        batch_number: editingMaterial ? editingMaterial.batch_number : generateBatchNumber(selectedDate, order)
      };
      onSubmit(assignmentData);
    } catch (error) {
      console.error('Error submitting material assignment:', error);
      // Handle error appropriately
    }
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
  //Handle the input change and fetch suggestions
  const handleGlueIdChange = async (event) => {
    const inputValue = event.target.value;
    setGlueId(inputValue); // Update the glueId state
  
    if (inputValue.length >= 2) {
      try {
        const response = await axios.get(`http://localhost:5000/suggestions/${inputValue}`);
        setMaterialIDSuggestions(response.data); // Update the materialIDSuggestions state
      } catch (error) {
        console.error('Error fetching material ID suggestions:', error);
        setMaterialIDSuggestions([]); // Reset the materialIDSuggestions in case of error
      }
    } else {
      setMaterialIDSuggestions([]); // Clear the suggestions if input is too short
    }
  };
  

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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500 sm:mx-0 sm:h-10 sm:w-10">
                    {/* Icon or image here */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                      <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                      {editingMaterial ? '編輯領料單' : '新增領料單'}
                    </Dialog.Title>
                    <div className="mt-9">
                      {editingMaterial ? (
                        <div>
                          <label className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                            打料日期
                          </label>
                          <input
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                            value={convertToTaiwanDate(editingMaterial.production_date)}
                            readOnly
                          />
                        </div>
                      ) : (
                      <ThemeProvider theme={newTheme}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="打料日期"
                              value={selectedDate}
                              onChange={setSelectedDate}
                              renderInput={(params) => <TextField {...params}  />}
                            />
                          </LocalizationProvider>
                        </ThemeProvider>
                        )}
                      <div>
                        <label htmlFor="glue_id" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                          膠料編號
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type="text"
                            id="glue_id"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                            placeholder="必須一模一樣"
                            value={glueId}
                            onChange={handleGlueIdChange}
                            autoComplete="off"
                          />
                          {materialIDSuggestions.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg overflow-y-auto max-h-60">
                              {materialIDSuggestions.map((suggestion, index) => (
                                <li
                                  key={index}
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setGlueId(suggestion.material_id);
                                    setMaterialIDSuggestions([]);
                                  }}
                                >
                                  {suggestion.material_id}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <label htmlFor="demand" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                          總需求量
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="demand"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                            placeholder=""
                            value={demand}
                            onChange={(e) => setDemand(e.target.value)}
                          />
                        </div>
                        <label htmlFor="order" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                          打料順序
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="order"
                            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${editingMaterial ? "focus:ring-red-600" : "focus:ring-green-600"}`}
                            placeholder="同天不能重複"
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            readOnly={editingMaterial ? true : false}
                          />
                        </div>
                        <div>
                          <label htmlFor="location" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                            機台
                          </label>
                          <select
                            id="location"
                            className="mt-2 block w-full h-10 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          >
                            <option>內</option>
                            <option>外</option>
                            <option>內,濾</option>
                            <option>外,濾</option>
                          </select>
                        </div>
                      </div>
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
