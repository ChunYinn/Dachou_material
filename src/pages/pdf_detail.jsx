import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PDFDetail = () => {
  const { pdfId } = useParams();
  const [pdfDetails, setPdfDetails] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [activeButton, setActiveButton] = useState(null);

  // Get the user's role from localStorage
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (pdfId) {
      axios.get(`http://localhost:5000/getpdf/${pdfId}`)
        .then(response => {
          setPdfDetails(response.data);
        })
        .catch(error => {
          console.error('Error fetching details:', error);
        });
    }
  }, [pdfId]);

  const handlePdfClick = (pdfType) => {
    setActiveButton(pdfType);

    const base64String = pdfType === 'main' ? pdfDetails.mainGluePdf : pdfDetails.promoterPdf;
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setSelectedPdf(pdfUrl);
  };
  

  if (!pdfDetails) {
    return (
    <div className="mt-20 flex flex-col justify-center items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div role="status">
          <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
        <span className="sr-only">Loading...</span>
      </div>
    
    </div>
  )}

  return (
    <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-4xl text-indigo-600 font-bold mb-10 mt-12">
        打料日期 {pdfDetails?.selectedDate} 編號:{pdfDetails?.id}
      </p>
  
      {/* Buttons for Manager: Show both */}
      {userRole === 'manager' && (
        <span className="isolate inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`relative inline-flex justify-center items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 ${activeButton === 'main' ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
            style={{ width: '100px' }}
            onClick={() => handlePdfClick('main')}
          >
            主膠PDF
          </button>
          <button
            type="button"
            className={`relative inline-flex justify-center items-center -ml-px rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 ${activeButton === 'promoter' ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
            style={{ width: '100px' }}
            onClick={() => handlePdfClick('promoter')}
          >
            促進劑PDF
          </button>
        </span>
      )}
  
      {/* Button for Main Glue Role: Show only Main Glue PDF */}
      {userRole === 'main glue' && (
        <button
          type="button"
          className={`relative inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50`}
          style={{ width: '150px' }}
          onClick={() => handlePdfClick('main')}
        >
          開啟主膠PDF
        </button>
      )}
  
      {/* Button for Promoter Role: Show only Promoter PDF */}
      {userRole === 'promoter' && (
        <button
          type="button"
          className={`relative inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50`}
          style={{ width: '150px' }}
          onClick={() => handlePdfClick('promoter')}
        >
          開啟促進劑PDF
        </button>
      )}
  
      {/* PDF Viewer */}
      {selectedPdf && (
        <iframe
          className='mt-12 mb-12'
          src={selectedPdf}
          style={{ width: '140%', height: '600px' }}
          frameBorder="0"
        />
      )}
    </div>
  );
  
};

export default PDFDetail;
