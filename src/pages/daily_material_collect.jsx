import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@headlessui/react'

export default function MaterialByDate() {
  const navigate = useNavigate();
  const [dataList, setDataList] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  // Function to fetch daily material status
  const fetchDailyMaterial = () => {
    axios.get('http://localhost:5000/get-daily-material-status')
      .then(response => {
        setDataList(response.data);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  };

  useEffect(() => {
    fetchDailyMaterial();
  }, []);

  const viewDetails = (date) => {
    navigate(`/details/${date}`);
  };
  
  const renderStatusWithIndicator = (status) => {
    let displayStatus = status;
    let statusColorClass = 'bg-red-500';
  
    if (status === 'Not Finish') {
      displayStatus = '未完成';
    } else if (status === 'Finished') {
      displayStatus = '完成';
      statusColorClass = 'bg-green-500';
    }
  
    return (
      <div className="flex items-center">
        <span
          className={`h-2 w-2 rounded-full mr-2 ${statusColorClass}`}
          aria-hidden="true"
        ></span>
        {displayStatus}
      </div>
    );
  };
  
  const filteredData = dataList.filter(data => 
    data.selected_date.toLowerCase().includes(filter.toLowerCase())
  );
  

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">

        
        
        {/* Title */}
        {/* Title and Filter Input */}
        <div className="text-center mt-12 mb-4">
          <p className="text-4xl font-bold mb-4">領料單總覽</p>
          <input
            type="text"
            placeholder="日期篩選..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        {/* Grid List */}
        <div className="mt-8 flow-root">
          <div className="overflow-x-auto shadow-lg">
            <div className="align-middle inline-block min-w-full rounded-lg"
              style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-300 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>

                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 py-4 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">
                      打料日期
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                      審核
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                      主膠領料狀態
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                      促進劑領料狀態
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredData.map((data) => (
                    <tr key={data.daily_status_id} className="even:bg-gray-50">

                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-500">{data.selected_date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <ToggleBTN initialStatus={data.auditStatus} date={data.selected_date}/>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {renderStatusWithIndicator(data.main_glue_status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {renderStatusWithIndicator(data.promoter_status)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-300 font-bold" onClick={() => viewDetails(data.selected_date)}>
                          查看
                        </button>
                      </td>
                      {/* Add/Delete button or other functionalities as needed */}
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

//toggle btn here
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function ToggleBTN({ initialStatus, date }) {
  const [enabled, setEnabled] = useState(initialStatus === 'Finished');
  const updateStatus = async () => {
    if (window.confirm(`您確定要改變 "日期: ${date}" 的審核狀態?`)) {
      try {
        const newStatus = enabled ? 'Not Finish' : 'Finished';
        await axios.put(`http://localhost:5000/updateAuditStatus/${date}`, { auditStatus: newStatus });
        setEnabled(!enabled); // Toggle the state only after successful DB update
      } catch (error) {
        console.error('Error updating audit status:', error);
        alert('Error updating audit status');
      }
    }
  };

  return (
    <Switch
      checked={enabled}
      onChange={updateStatus}
      className={classNames(
        enabled ? 'bg-green-600' : 'bg-red-500',
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={classNames(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
        )}
      >
        <span
          className={classNames(
            enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
            'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
          )}
          aria-hidden="true"
        >
          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={classNames(
            enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
            'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
          )}
          aria-hidden="true"
        >
          <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  )
}