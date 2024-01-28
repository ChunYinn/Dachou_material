import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import '../../src/index.css'
import { CalendarIcon } from '@heroicons/react/20/solid'; 


export default function ChemicalInput() {
    const navigate = useNavigate();
  // State for filters
  const [dateFilter, setDateFilter] = useState('');
  const [idFilter, setIDFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [batchFilter, setBatchNoFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [supplierBatchFilter, setSupplierBatchFilter] = useState('');




  const [chemicals, setChemicals] = useState([]); // State to store the chemicals

  // Function to fetch chemicals
  const fetchChemicals = () => {
    axios.get('http://localhost:5000/get-chemical_inputs')
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
  



  //--filter function
  // Function to handle filter change for date
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleIDFilterChange = (e) => {
    setIDFilter(e.target.value);
  };

  // Function to handle filter change for glue ID
  const handleNameFilterChange = (e) => {
    setNameFilter(e.target.value);
  };

  const handleBatchNoFilterChange = (e) => {
    setBatchNoFilter(e.target.value);
  };

  const handlePositionFilterChange = (e) => {
    setPositionFilter(e.target.value);
  };

  const handleSupplierFilterChange = (e) => {
    setSupplierFilter(e.target.value);
  };

  const handleEmployeeFilterChange = (e) => {
    setEmployeeFilter(e.target.value);
  };

  const handleQualityFilterChange = (e) => {
    setQualityFilter(e.target.value);
  };

  const handleSupplierBatchFilterChange = (e) => {
    setSupplierBatchFilter(e.target.value);
  };
  

  // Filtered materials
  const filteredChemicals = chemicals.filter((chemical) => {
    
    return (
        chemical.input_date.includes(dateFilter) &&
        chemical.chemical_raw_material_id.includes(idFilter) &&
        chemical.chemical_raw_material_name.includes(nameFilter) && 
        chemical.chemical_raw_material_batch_no.includes(batchFilter) &&
        chemical.chemical_raw_material_position.includes(positionFilter) && 
        chemical.chemical_raw_material_supplier.includes(supplierFilter) &&
        chemical.test_employee.includes(employeeFilter) &&
        chemical.quality_check.includes(qualityFilter) &&
        chemical.supplier_material_batch_no.includes(supplierBatchFilter)
    );
  });

  return (
    
    <div className="flex justify-center items-center mt-14">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-semibold leading-6 text-gray-900">化工入庫查詢</h1>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '60vh', overflowY: 'auto' }} >
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                    <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center"> {/* Flex container */}
                          入庫日期
                        </div>
                        <input type="text" value={dateFilter} onChange={handleDateFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: 01-01"/> {/* Adjusted width */}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          化工原料ID
                        </div>
                        <input type="text" value={idFilter} onChange={handleIDFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: DA03"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          化工原料名稱
                        </div>
                        <input type="text" value={nameFilter} onChange={handleNameFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: NR3#"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          批號
                        </div>
                        <input type="text" value={batchFilter} onChange={handleBatchNoFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: DA0324012201"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        入庫公斤
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        目前公斤
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          位子
                        </div>
                        <input type="text" value={positionFilter} onChange={handlePositionFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: A01"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          廠商
                        </div>
                        <input type="text" value={supplierFilter} onChange={handleSupplierFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: 達洲"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        硬度
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          檢測人員
                        </div>
                        <input type="text" value={employeeFilter} onChange={handleEmployeeFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: 謙翔"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          合格
                        </div>
                        <input type="text" value={qualityFilter} onChange={handleQualityFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="ex: 合格"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          廠商批號
                        </div>
                        <input type="text" value={supplierBatchFilter} onChange={handleSupplierBatchFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder=""/>
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
                        <tr key={chemical.chemical_raw_material_batch_no}>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.input_date}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_id}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_batch_no}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_input_kg}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.batch_kg}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_position}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_supplier}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.input_test_hardness}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.test_employee}</td>
                          <td className={`whitespace-nowrap px-3 py-4 ${chemical.quality_check === '合格' ? 'text-green-600' : chemical.quality_check === '不合格' ? 'text-red-500' : 'text-gray-500'}`}>
                            {chemical.quality_check}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.supplier_material_batch_no}</td>
                          
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

      
    </div>
    
  )
}

