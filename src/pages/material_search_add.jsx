import { Fragment, useState  } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/20/solid'

//defaut value for left table showing material basic info
const labels = ["膠料編號","材質","硬度","顏色","特殊用途","用途","主成分"];
// const data = ["", "", "", "", "", "", ""];


export default function MaterialSearchAdd() {

  // State for the material number input
  const [materialID, setmaterialID] = useState('');
  // State for the fetched material data
  const initialData = {
    material_id: "",
    property_name: "",
    hardness: "",
    color_name: "",
    usage_type: "",
    customer_usage: "",
    main_ingredient: ""
  };
  
  const [materialData, setMaterialData] = useState(initialData);
  const [materialTableData, setMaterialTableData] = useState([]);
  //------新增toggle-----------------------------
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const handleAddClick = () => {
    toggleDialog();
  };

  const onSubmitNewMaterial = async (exportData) => {
    try {
      // Send rubber data to the rubber_file table
      const responseRubber = await axios.post('http://localhost:5000/add-rubber', {
        rubberData: exportData.rubberData
      });
  
      // Send raw materials data to the rubber_formula_file table
      console.log(exportData.rawMaterials);
      const responseFormula = await axios.post('http://localhost:5000/add-rubber-formula', {
        rawMaterials: exportData.rawMaterials
      });
  
      // Handle responses
      console.log(responseRubber.data.message);
      console.log(responseFormula.data.message);
  
      // If you need to do something after saving data, like redirecting or updating state, do it here
    } catch (error) {
      console.error('Error submitting new material:', error);
      // Handle errors, such as displaying a notification to the user
    }
  };

  //-------------------------------------
  // Event handler for updating the material number input
  const handleMaterialNumberChange = (event) => {
    setmaterialID(event.target.value);
  };

// Event handler for the search button
const handleSearch = async () => {
  if (!materialID) {
    setMaterialData(initialData);
    setMaterialTableData([]);
    window.alert('請輸入膠料編號'); // Alert if materialID is empty
    return;
  }

  // Perform both API calls concurrently
  try {
    const infoResponse = axios.get(`http://localhost:5000/get-material-info/${materialID}`);
    const tableResponse = axios.get(`http://localhost:5000/get-material-table-data/${materialID}`);
    
    // Wait for both API calls to finish
    const [infoRes, tableRes] = await Promise.all([infoResponse, tableResponse]);

    // Check and update state for the first call response
    if (infoRes.data && Object.keys(infoRes.data).length > 0) {
      setMaterialData(infoRes.data);
    } else {
      setMaterialData(initialData); // Reset to initial state if no data found
    }

    // Check and update state for the second call response
    if (tableRes.data && Array.isArray(tableRes.data) && tableRes.data.length > 0) {
      setMaterialTableData(tableRes.data);
    } else {
      setMaterialTableData([]); // Reset to empty array if no data found
    }
  } catch (error) {
    // If either call fails, handle accordingly
    if (error.response && error.response.status === 404) {
      window.alert('查無此ID資料');
    } else {
      console.error('Error fetching material data:', error);
    }
    setMaterialData(initialData); // Reset to initial state on error
    setMaterialTableData([]); // Reset to empty array on error
  }
};

  // Calculate totals only if there is data
  const totalUsage = materialTableData.length > 0
  ? materialTableData.reduce((acc, item) => acc + parseFloat(item.usage_kg), 0)
  : 0.00;

  const totalPrice = materialTableData.length > 0
  ? materialTableData.reduce((acc, item) => acc + parseFloat(item.unit_price), 0)
  : 0.00;

  // Format the totals to always show two decimal places
  const formattedTotalUsage = totalUsage.toFixed(2);
  const formattedTotalPrice = totalPrice.toFixed(2);

  return (
    <div className="flex justify-center items-center mt-14">

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-4xl mb-4 font-semibold leading-6 text-gray-900">膠料基本檔</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-2">
        
              <div className="relative">
                <label
                  htmlFor="name"
                  className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                >
                  膠料編號
                </label>
                <input
                  type="text"
                  name="materialID"
                  id="name"
                  value={materialID}
                  onChange={handleMaterialNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="HA-A0-00-05-W"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="block w-16 rounded-md bg-indigo-700 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
              >
                搜尋
              </button>
              <button
                type="button"
                className="block rounded-md w-32 bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={handleAddClick}
              >
                +新增
              </button>
            </div>
          </div>

          <div className="flex flex-wrap mt-10">
            
          <div className="flex flex-col" style={{ width: "35%"}}>
            {/* left table showing material basic info -------------------*/}
            <div className="flex flex-col p-5 bg-white rounded-lg shadow-lg ring-1 ring-gray-300" style={{height: "362px" }}>
              {labels.map((label, index) => {
                const dataKey = Object.keys(materialData)[index]; // Corresponding key in the materialData
                const dataValue = materialData[dataKey]; // Value from the materialData

                return (
                  <div className="flex items-center mt-2" key={label}>
                    <div className="w-32">
                      <label className="text-sm font-bold leading-6 text-gray-900">
                        {label}
                      </label>
                    </div>
                    <textarea
                      name={label}
                      id={label}
                      value={dataValue}
                      className="flex-grow rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      readOnly
                      rows={1} // Adjust number of rows as needed
                      style={{ resize: 'none', width:"80%"}} // Prevents resizing
                    />
                  </div>
                );
              })}
            </div>


            {/* left table below showing kg -------------------*/}
            <div className="mt-4 p-5 bg-white rounded-lg shadow-lg ring-1 ring-gray-300 flex flex-col justify-center text-center" style={{height: "100px" }}>
              <div className="flex gap-4 text-center justify-center">
                <span className="text-sm text-gray-600">總用量: <span className="font-semibold">{formattedTotalUsage} kg</span></span>
                <span className="text-sm text-gray-600">總單價: <span className="font-semibold">{formattedTotalPrice}</span></span>
              </div>
              <span className="text-lg text-gray-900 font-bold mt-1">每公斤單價: <span className="text-xl text-green-600">{`$${(totalPrice / totalUsage).toFixed(2)}`}</span></span>
            </div>
          </div>
      

            
            {/* formula table ----------------------------------------------*/}
            <div className="pl-4 sm:pl-6 lg:pl-8" style={{width:"65%"}}>  
              <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ height: '65vh', overflowY: 'auto' }}>
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              創建日期
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              化工原料ID
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              化工原料名稱
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              用量
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              功能
                            </th> 
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              順序
                            </th> 
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-gray-900">
                              用量單價
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {materialTableData.length > 0 ? (
                            materialTableData.map((tabledata, index) => (
                              <tr key={`${tabledata.id}-${index}`}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {tabledata.creation_date}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.chemical_raw_material_id}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.chemical_raw_material_name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.usage_kg}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.material_function}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.sequence}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.unit_price}</td>
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
            {/* {here----------------------------------------------}   */}
          </div>
          
        {/* {-----------Toggle 新增-----------------------------------}   */}
        
        <AddMaterialDialog open={isDialogOpen} onClose={toggleDialog} onExportSubmit={onSubmitNewMaterial} />
        


        </div>
    </div>
    
  )
}


export function AddMaterialDialog({ open, onClose, onExportSubmit }) {
  const [materialID, setMaterialID] = useState('');
  const [purpose, setPurpose] = useState('');
  const [mainIngredient, setMainIngredient] = useState('');
  const [rawMaterialID, setRawMaterialID] = useState('');
  const [usageKg, setUsageKg] = useState('');
  const [materialFunction, setMaterialFunction] = useState('');
  const [order, setOrder] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  // const [addRubberData, setAddRubberData] = useState({});

  // Handle the submission of export data
  const handleSubmit = () => {
    if (!materialID || !purpose || !mainIngredient) {
      alert("請填寫膠料編號、用途、和主成分");
      return;
    }
  
    if (!validateMaterialID(materialID)) {
      alert("膠料編號格式不正確");
      return false;
    }
  
    // Get the parts of the material ID
    const parts = materialID.split('-');
    const propertyID = parts[0][1];
    const usageID = parts[1][0];
    const hardness = parts[2];
    const stickiness = parts[1][1];
    const colorID = parts[4];
  
    // Create the rubber data object directly
    const rubberData = {
      materialID,
      propertyID,
      usageID,
      hardness,
      stickiness,
      colorID,
      customerUsage: purpose,
      mainIngredient
    };
  
    // Assuming the exportData includes both the main fields and the rawMaterials list
    const exportData = { rubberData, rawMaterials };
    onExportSubmit(exportData);
    // Reset all fields
    resetFields();
    onClose(false);
  };
  

  //formate like: HE-R9-30-01-W
  const validateMaterialID = (id) => {
    const regex = /^[A-Z]{2}-[A-Z][0-9]-[0-9]{2}-[0-9]{2}-[A-Z]$/;
    return regex.test(id);
  };

  const handleAddRawMaterial = async() => {
    if (!rawMaterialID || !usageKg) {
      alert("請填寫完整的化工原料資料");
      return;
    }

    const chemicalRawMaterialName = await fetchMaterialNameByID(rawMaterialID);

    const now = new Date();
    const taipeiTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const creationDate = taipeiTime.toISOString().slice(0, 10);

    const newEntry = {
      id: rawMaterials.length + 1,
      material_id: materialID,
      creationDate: creationDate,
      chemicalRawMaterialID: rawMaterialID,
      chemicalRawMaterialName: chemicalRawMaterialName || "未知名稱",
      usageKg,
      materialFunction,
      sequence: order,
    };
    setRawMaterials([...rawMaterials, newEntry]);
    // Clear fields after adding
    setRawMaterialID('');
    setUsageKg('');
    setMaterialFunction('');
    setOrder('');
  };

  const resetFields = () => {
    setMaterialID('');
    setPurpose('');
    setMainIngredient('');
    setRawMaterialID('');
    setUsageKg('');
    setMaterialFunction('');
    setOrder('');
    setRawMaterials([]);
  };

  async function fetchMaterialNameByID(id) {
    try {
      const response = await fetch(`http://localhost:5000/get-material-name/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Material Name:', data.chemicalRawMaterialName);
        return data.chemicalRawMaterialName;
      } else {
        throw new Error('Material not found');
      }
    } catch (error) {
      console.error('Error fetching material name:', error);
    }
  }
  

  const handleDeleteRawMaterial = (idToDelete) => {
    // Filter out the raw material entry with the matching id
    const updatedRawMaterials = rawMaterials.filter(item => item.id !== idToDelete);
    // Update the state with the filtered array
    setRawMaterials(updatedRawMaterials);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:max-w-5xl sm:w-full sm:p-6">
                {/* Content */}
                <div className="mt-3 text-center sm:mt-0">
                  <Dialog.Title as="h3" className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                    新增膠料配方
                  </Dialog.Title>

                  {/* Input Fields */}
                  <div className="mt-7 mb-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 p-6 bg-white rounded-lg shadow border border-gray-200">
                    {/* Input Fields */}
                    <div className="relative sm:col-span-1">
                      <label
                        htmlFor="new-material-id"
                        className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-gray-900"
                      >
                        膠料編號
                      </label>
                      <input
                        type="text"
                        name="material-id"
                        id="new-material-id"
                        onChange={(e) => setMaterialID(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder=""
                      />
                    </div>
                    <div className="relative sm:col-span-2">
                      <label
                        htmlFor="purpose"
                        className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-gray-900"
                      >
                        用途
                      </label>
                      <textarea
                        name="purpose"
                        id="purpose"
                        rows={1}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder=""
                      />
                    </div>
                    <div className="relative sm:col-span-3">
                      <label
                        htmlFor="main-ingredient"
                        className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-gray-900"
                      >
                        主成分
                      </label>
                      <textarea
                        name="main-ingredient"
                        id="main-ingredient"
                        rows={1}
                        onChange={(e) => setMainIngredient(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder=""
                      />
                    </div>
                  </div>                 
                </div>
                {/* Divider */}
                <div className="my-5 border-t border-gray-300"></div>
                {/* input for table */}
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="relative sm:col-span-1">
                    <label
                      htmlFor="raw-material-id"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-gray-900"
                    >
                      化工原料ID
                    </label>
                    <input
                      type="text"
                      name="raw-material-id"
                      id="raw-material-id"
                      value={rawMaterialID}
                      onChange={(e) => setRawMaterialID(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="DA03"
                    />
                  </div>
                  <div className="relative sm:col-span-1">
                    <label
                      htmlFor="usageKg"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-gray-900"
                    >
                      用量
                    </label>
                    <input
                      type="number"
                      name="usageKg"
                      id="usageKg"
                      value={usageKg}
                      onChange={(e) => setUsageKg(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="..kg"
                    />
                  </div>
                  <div className="relative sm:col-span-2">
                    <label
                      htmlFor="materialFunction"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-gray-900"
                    >
                      功能
                    </label>
                    <input
                      type="text"
                      name="materialFunction"
                      id="materialFunction"
                      value={materialFunction}
                      onChange={(e) => setMaterialFunction(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="ex:增加硬度"
                    />
                  </div>
                  <div className="relative sm:col-span-1">
                    <label
                      htmlFor="order"
                      className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-gray-900"
                    >
                      順序
                    </label>
                    <input
                      type="number"
                      name="order"
                      id="order"
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="..kg"
                    />
                  </div>
                  <div className=" sm:col-span-1 items-center">
                    <button
                      type="button"
                      className="rounded-full bg-green-600 p-1.5 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      onClick={handleAddRawMaterial}
                    >
                      <PlusIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {/* table */}
                <div className="flow-root mt-5">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ height: '40vh', overflowY: 'auto' }}>
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              創建日期
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              化工原料ID
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              化工原料名稱
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              用量
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              功能
                            </th> 
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              順序
                            </th> 
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-gray-900">
                              <span className="sr-only">delete</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {rawMaterials.length > 0 ? (
                            rawMaterials.map((tabledata, index) => (
                              <tr key={`${tabledata.id}-${index}`}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {tabledata.creationDate}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.chemicalRawMaterialID}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.chemicalRawMaterialName}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.usageKg}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.materialFunction}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.sequence}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium">
                                  <button className="text-red-600 hover:text-red-900 font-bold" onClick={() => handleDeleteRawMaterial(tabledata.id)}>
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