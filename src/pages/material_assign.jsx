import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import axios from 'axios';

export default function MaterialAssign() {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [materials, setMaterials] = useState([]); // State to store the materials

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

  // Function to handle adding new material
  const handleAddClick = (assignmentData) => {
    axios.post('http://localhost:5000/assign-material', assignmentData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(() => {
      fetchMaterials(); // Fetch the updated list of materials
      setIsDialogOpen(false); // Close the dialog
      console.log('Material added!');
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
  };

  return (
    <div className="flex justify-center items-center mt-14">
        <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-semibold leading-6 text-gray-900">領化工原料登記</h1>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-4">
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
            >
              主膠領料
            </button>
            <button
              type="button"
              className="block w-32 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              促進劑領料
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        打料日期
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        膠料編號
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        總需求量
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        打料順序
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        機台
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                          {material.production_date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{material.material_id}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{material.total_demand}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{material.production_sequence}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{material.production_machine}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900 font-bold" onClick={() => handleDelete(material.id)}>
                            刪除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <DialogComponent isOpen={isDialogOpen} onClose={toggleDialog} onSubmit={handleAddClick} />
      )}
    </div>
    
  )
}

function DialogComponent({ isOpen, onClose, onSubmit }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [glueId, setGlueId] = useState('');
  const [demand, setDemand] = useState('');
  const [order, setOrder] = useState('');
  const [location, setLocation] = useState('內');

  const prepareDataAndSubmit = () => {
    if (!selectedDate || !glueId || !demand || !order || !location) {
      alert("Please fill in all fields.");
      return;
    }
    const taiwanDate = selectedDate.add(8, 'hour').format('YYYY-MM-DD');

    const assignmentData = {
      production_date: taiwanDate,
      material_id: glueId,
      total_demand: demand,
      production_sequence: order,
      production_machine: location,
    };

    onSubmit(assignmentData); // Call the onSubmit prop function
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
                      新增領料單
                    </Dialog.Title>
                    <div className="mt-9">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="打料日期"
                          value={selectedDate}
                          onChange={setSelectedDate}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </LocalizationProvider>
                      <div>
                        <label htmlFor="glue_id" className="block mt-3 text-sm font-bold leading-6 text-gray-900">
                          膠料編號
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="glue_id"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                            placeholder=""
                            value={glueId}
                            onChange={(e) => setGlueId(e.target.value)}
                          />
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
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                            placeholder=""
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
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
                    新增
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
export function BasicDatePicker({ onChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="打料日期"
        onChange={onChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}
