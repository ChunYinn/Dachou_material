import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function List_PDFs() {
  const navigate = useNavigate();
  const [pdfList, setPdfList] = useState([]);

  // Extracted function to fetch PDF list
  const fetchPdfList = () => {
    axios.get('http://localhost:5000/getpdfs24hrs')
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
  const viewDetails = (pdfId) => {
    navigate(`/pdf/${pdfId}`);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mt-12">
          <p className="text-4xl font-bold mb-10">達州原料部領料單(今日)</p>
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
                      打料日期?
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
                        <span className={`inline-flex items-center rounded-full px-2 py-1 font-medium 
                                        ${pdf.auditStatus === 'Not Finish' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {pdf.auditStatus === 'Not Finish' ? '未審核' : '已審核'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pdf.main_glue_pdf_name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pdf.promoter_pdf_name}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-300 font-bold" onClick={() => viewDetails(pdf.id)}>
                          查看
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

