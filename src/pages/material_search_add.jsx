import React, { useState } from 'react';
import axios from 'axios';


const datatable = [
  { date: '2024/01/01', id: 'DH10', name: 'AN-300', usage: '888',function:'軟化劑',order:'1',price:'$100' },
  { date: '2024/01/01', id: 'DH10', name: 'AN-300', usage: '888',function:'軟化劑',order:'1',price:'$100' },
]

//defaut value for left table showing material basic info
const labels = ["膠料編號","材質","硬度","顏色","特殊用途","用途","主成分"];
const data = ["", "", "", "", "", "", ""];


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
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.material_id}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tabledata.chemical_raw_material_id}</td>
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
          


        </div>
    </div>
    
  )
}