import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@headlessui/react'

export default function List_PDFs() {
  const navigate = useNavigate();
  const [pdfList, setPdfList] = useState([]);

  // Extracted function to fetch PDF list
  const fetchPdfList = () => {
    axios.get('http://localhost:5000/getpdfs')
      .then(response => {
        setPdfList(response.data);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  };

  useEffect(() => {
    fetchPdfList(); // Fetch the list on component mount
  }, []);

  // Function to delete a record and then refresh the list
  const deleteRecord = (id) => {
    if (window.confirm('您確定要刪除此項目?')) {
      axios.delete(`http://localhost:5000/deletepdf/${id}`)
        .then(response => {
          alert('成功刪除!');
          console.log('Record deleted:', response.data);
          setPdfList(pdfList.filter((pdf) => pdf.id !== id)); // Update state without re-fetching
        })
        .catch(error => {
          console.error('There was an error deleting the record:', error);
          alert('There was an error deleting the record.');
        });
    }
  };

  // Function to delete a record and then refresh the list
  const viewDetails = (pdfId) => {
    navigate(`/pdf/${pdfId}`);
  };

  // Function to render PDF name with status indicator
  const renderPdfNameWithStatus = (pdfName, status) => (
    <div className="flex items-center">
      <span
        className={`h-2 w-2 rounded-full mr-2 ${status === 'Not Finish' ? 'bg-red-500' : 'bg-green-500'}`}
        aria-hidden="true"
      ></span>
      {pdfName}
    </div>
  );

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mt-12">
          <p className="text-4xl font-bold mb-10">領料單總覽</p>
        </div>

        {/* Grid List */}
        <div className="mt-8 flow-root">
          <div className="overflow-x-auto shadow-lg">
            <div className="align-middle inline-block min-w-full rounded-lg"
              style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-300 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      ID
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                      打料日期
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                      審核
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                      主膠PDF名稱
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                      促進劑PDF名稱
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      
                    </th>
                    <th className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pdfList.map((pdf) => (
                    <tr key={pdf.id} className="even:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {pdf.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pdf.selected_date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <ToggleBTN initialStatus={pdf.auditStatus} pdfId={pdf.id}/>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {renderPdfNameWithStatus(pdf.main_glue_pdf_name, pdf.main_glue_status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {renderPdfNameWithStatus(pdf.promoter_pdf_name, pdf.promoter_status)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-300 font-bold" onClick={() => viewDetails(pdf.id)}>
                          查看
                        </button>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <button className="text-red-600 hover:text-red-800 font-bold" onClick={() => deleteRecord(pdf.id)}>
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
  )
}

//toggle btn here
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function ToggleBTN({ initialStatus, pdfId }) {
  const [enabled, setEnabled] = useState(initialStatus === 'Finished');
  const updateStatus = async () => {
    if (window.confirm(`您確定要改變 "ID${pdfId}" 的審核狀態?`)) {
      try {
        const newStatus = enabled ? 'Not Finish' : 'Finished';
        await axios.put(`http://localhost:5000/updatepdf/${pdfId}`, { auditStatus: newStatus });
        setEnabled(!enabled); // Toggle the state only after successful DB update
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
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