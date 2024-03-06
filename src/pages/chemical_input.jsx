import { useRef, useState, useEffect } from 'react'
import axios from 'axios';
import '../../src/index.css'
import JsBarcode from 'jsbarcode';


export default function ChemicalInput() {
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
  // New state for tracking selected rows
  const [selectedRows, setSelectedRows] = useState([]);
  const barcodeRef = useRef(); // Ref for the hidden barcode element

  // Function to handle selection of rows
  const toggleRowSelected = (batchNo) => {
    setSelectedRows(prevSelectedRows =>
      prevSelectedRows.includes(batchNo)
        ? prevSelectedRows.filter(id => id !== batchNo)
        : [...prevSelectedRows, batchNo]
    );
  };

  useEffect(() => {
    // This effect is used to initially generate barcodes, it won't directly affect the print function
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, 'Initial', {
        format: 'CODE128',
        displayValue: false,
      });
    }
  }, []);

  const generateBarcodeDataUrl = (text) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, text, {
        format: 'CODE128',
        displayValue: false,
      });
      resolve(canvas.toDataURL("image/png"));
    });
  };

  // Function to format and print selected rows
  const printSelectedRows = async () => {
    // Filter out only the selected chemicals based on batch number
    const selectedChemicals = chemicals.filter(chemical =>
      selectedRows.includes(chemical.chemical_raw_material_batch_no)
    );
  
    // Map over the selected chemicals to create print content
    const printContent = await Promise.all(selectedChemicals.map(async (chemical, index) => {
      const barcodeDataUrl = await generateBarcodeDataUrl(chemical.chemical_raw_material_batch_no);
      return `
      <div style="${index !== 0 ? 'page-break-before: always;' : ''} font-family: 'Arial', sans-serif; width: 300px; margin: auto;">
          <img src="${barcodeDataUrl}" alt="Barcode" style="width: 100%;">
        </div>
      <div style="text-align: center;">
        <p style="margin-top: 5px; font-size: 20px; font-weight: bold;">${chemical.chemical_raw_material_batch_no}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <tr>
          <td style="border: 1px solid #000; padding: 5px; width: 50%;">
            <span style="font-size: smaller;">化工原料ID</span><br>
            <span style="font-size: larger; font-weight: bold;">${chemical.chemical_raw_material_id}</span>
          </td>
          <td style="border: 1px solid #000; padding: 5px; width: 50%;" colspan="2">
            <span style="font-size: smaller;">化工原料名称</span><br>
            <span style="font-size: larger; font-weight: bold;">${chemical.chemical_raw_material_name}</span>
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px;">
            <span style="font-size: smaller;">廠商批號</span><br>
            <span style="font-size: larger; font-weight: bold;">${chemical.supplier_material_batch_no}</span>
          </td>
          <td style="border: 1px solid #000; padding: 5px;" colspan="2">
            <span style="font-size: smaller;">廠商</span><br>
            <span style="font-size: larger; font-weight: bold;">${chemical.chemical_raw_material_supplier}</span>
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px;">
            <span style="font-size: smaller;">進貨日期</span><br>
            <span style="font-size: larger; font-weight: bold;">${chemical.input_date}</span>
          </td>
          <td style="border: 1px solid #000; padding: 5px;">
            <span style="font-size: smaller;">硬度</span><br>
            <span style="font-size: larger; font-weight: bold;">${chemical.input_test_hardness}</span>
          </td>
          <td style="border: 1px solid #000; padding: 5px;">
            <span style="font-size: smaller;">重量</span><br>
            <span style="font-size: larger; font-weight: bold;">${chemical.chemical_raw_material_input_kg}</span>
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px;" width="50%;">使用日期</td>
          <td style="border: 1px solid #000; padding: 5px;" width="50%;" colspan="2">使用重量</td>
        </tr>
        <!-- Empty rows with increased height for spacing -->
        <tr>
          <td style="border: 1px solid #000; padding: 5px; height: 50px;">&nbsp;</td>
          <td colspan="2" style="border: 1px solid #000; padding: 5px; height: 50px;">&nbsp;</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px; height: 50px;">&nbsp;</td>
          <td colspan="2" style="border: 1px solid #000; padding: 5px; height: 50px;">&nbsp;</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px; height: 50px;">&nbsp;</td>
          <td colspan="2" style="border: 1px solid #000; padding: 5px; height: 50px;">&nbsp;</td>
        </tr>
      </table>
    </div>



    
      `;
    }));

    
    // Open a new print window and write the print content
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printContent.join('')); // Ensure you join the array into a single string
    printWindow.document.write('</body></html>');
    printWindow.document.close(); // Close the document to finish loading

    // Add a slight delay before printing to ensure content is fully loaded and rendered
    setTimeout(() => {
      printWindow.print();
      printWindow.close(); // Close the print window after printing
    }, 500); // Adjust delay as needed
  };
  

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
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-4">
            <button
              type="button"
              className="block w-32 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={printSelectedRows}
            >
              列印貼紙
            </button>
          </div>
        </div>
        <canvas ref={barcodeRef} style={{ display: 'none' }}></canvas>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '60vh', overflowY: 'auto' }} >
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm text-gray-900 sm:pl-6" style={{width: '12.5%'}}>
                        <div className="flex items-center"> {/* Flex container */}
                          入庫日期
                        </div>
                        <input type="text" value={dateFilter} onChange={handleDateFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="01-01"/> {/* Adjusted width */}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          化工原料ID
                        </div>
                        <input type="text" value={idFilter} onChange={handleIDFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="DA03"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          化工原料名稱
                        </div>
                        <input type="text" value={nameFilter} onChange={handleNameFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="NR3#"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          批號
                        </div>
                        <input type="text" value={batchFilter} onChange={handleBatchNoFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="DA0324012201"/>
                      </th>
                      
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          位子
                        </div>
                        <input type="text" value={positionFilter} onChange={handlePositionFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="A01"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          廠商
                        </div>
                        <input type="text" value={supplierFilter} onChange={handleSupplierFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="達洲"/>
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
                        <div className="flex items-center">
                          檢測人員
                        </div>
                        <input type="text" value={employeeFilter} onChange={handleEmployeeFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="謙翔"/>
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        <div className="flex items-center">
                          合格
                        </div>
                        <input type="text" value={qualityFilter} onChange={handleQualityFilterChange} 
                        className="mt-2 block w-full h-7 p-1 border rounded small-placeholder"
                        placeholder="合格"/>
                      </th>
                      
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        入庫公斤
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        目前公斤
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-sm text-gray-900 whitespace-nowrap" style={{width: '12.5%'}}>
                        硬度
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
                          <td className="whitespace-nowrap py-4 pl-4 pr-3  text-gray-500 sm:pl-6">
                          {chemical.input_date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_id}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_batch_no}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_position}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_supplier}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.supplier_material_batch_no}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.test_employee}</td>
                          <td className={`whitespace-nowrap px-3 py-4 ${chemical.quality_check === '合格' ? 'text-green-600' : chemical.quality_check === '不合格' ? 'text-red-500' : 'text-gray-500'}`}>
                            {chemical.quality_check}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.chemical_raw_material_input_kg}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.batch_kg}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-gray-500">{chemical.input_test_hardness}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(chemical.chemical_raw_material_batch_no)}
                              onChange={() => toggleRowSelected(chemical.chemical_raw_material_batch_no)}
                            />
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

      
    </div>
    
  )
}

