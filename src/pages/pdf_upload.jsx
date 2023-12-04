import * as React from 'react';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BsFiletypePdf } from "react-icons/bs";
import TextField from '@mui/material/TextField'; 

export function BasicDatePicker({ onChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="選擇日期"
        onChange={onChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

export function Upload({ label, id, onFileChange }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const newFile = event.target.files[0];
    if (newFile) {
      const fileUrl = URL.createObjectURL(newFile);
      setFile(fileUrl);

      // Call the external onFileChange handler with the file
      if (onFileChange) {
        onFileChange(newFile);
      }
    }
  };

  return (
    <div className="w-400 text-center p-4"> {/* Add p-4 for some padding */}
      <label htmlFor={id} className="block text-xl font-semibold leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2 flex flex-col justify-center items-center rounded-lg border border-dashed border-gray-900/25" style={{ width: '400px' }}>
        <BsFiletypePdf className="mt-5 h-10 w-10 text-gray-300" aria-hidden="true" />
        <div className="mt-4 text-sm leading-6 text-gray-600">
          <label
            htmlFor={id}
            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
          >
            <span>Upload a file</span>
            <input
              id={id}
              name={id}
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept="application/pdf"
            />
          </label>
        </div>
        <p className="text-xs mb-7 text-gray-600">PDF up to 10MB</p>
        {file && (
          <iframe
            src={file}
            className="w-full" // Use TailwindCSS class instead of inline style
            style={{ height: '500px' }}
            frameBorder="0"
            title={`${label} PDF preview`}
          ></iframe>
        )}
      </div>
    </div>
  );
}

export default function UploadPDF() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [mainGluePdf, setMainGluePdf] = useState(null);
  const [promoterPdf, setPromoterPdf] = useState(null);

  const handleSubmit = () => {
    const submissionData = {
      date: selectedDate,
      mainGluePdf: mainGluePdf ? mainGluePdf.name : 'No file',
      promoterPdf: promoterPdf ? promoterPdf.name : 'No file',
    };

    console.log("Submission Data:", JSON.stringify(submissionData, null, 2));
  };

  return (
    <div className="flex flex-col items-center justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
      <p className="text-4xl font-bold text-gray-900 mb-7">領料單輸入</p>
      <BasicDatePicker onChange={(newValue) => setSelectedDate(newValue)} />
      <div className="flex justify-center space-x-6 mt-6">
        <Upload label="主膠PDF" id="main-glue-pdf" onFileChange={setMainGluePdf} />
        <Upload label="促進劑PDF" id="promoter-pdf" onFileChange={setPromoterPdf} />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mt-11 mb-11"
      >
        Upload
      </button>
    </div>
  );
}
