import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PDFDetail = () => {
  const { pdfId } = useParams();
  const [pdfDetails, setPdfDetails] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [activeButton, setActiveButton] = useState(null);

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
    return <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-4xl text-indigo-600 font-bold mb-10 mt-12">打料日期 {pdfDetails.selectedDate} 編號:{pdfDetails.id}</p>
      
      {/* Buttons */}
      <span className="isolate inline-flex rounded-md shadow-sm">
        <button
          type="button"
          className={`relative inline-flex justify-center items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 ${activeButton === 'main' ? 'bg-gray-200' : 'hover:bg-gray-50'} focus:z-10`}
          style={{ width: '100px' }}
          onClick={() => handlePdfClick('main')}
        >
          主膠PDF
        </button>
        <button
          type="button"
          className={`relative inline-flex justify-center items-center -ml-px rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 ${activeButton === 'promoter' ? 'bg-gray-200' : 'hover:bg-gray-50'} focus:z-10`}
          style={{ width: '100px' }}
          onClick={() => handlePdfClick('promoter')}
        >
          促進劑PDF
        </button>
      </span>

      {/* PDF Viewer */}
      {selectedPdf && (
        <iframe
          className='mt-12 mb-12'
          src={selectedPdf}
          style={{ width: '150%', height: '600px' }}
          frameBorder="0"
        />
      )}
    </div>
  );
};

export default PDFDetail;
