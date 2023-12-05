import * as React from 'react';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BsFiletypePdf } from "react-icons/bs";
import TextField from '@mui/material/TextField'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const newFile = event.target.files[0];
    if (newFile) {
      setFileName(newFile.name);
      const fileUrl = URL.createObjectURL(newFile);
      setFile(fileUrl);
      onFileChange({ file: newFile, name: newFile.name });
    }
  };

  return (
    <div className="w-400 text-center p-4">
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
        <p className="text-xs mb-7 text-gray-600">PDF up to 1MB</p>
        {file && (
          <iframe
            src={file}
            className="w-full"
            style={{ height: '500px' }}
            frameBorder="0"
            title={`${label} PDF preview`}
          ></iframe>
        )}
        {fileName && (
          <p className="mt-2 mb-2 text-sm text-indigo-400">{fileName}</p>
        )}
      </div>
    </div>
  );
}

export default function UploadPDF() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [mainGluePdf, setMainGluePdf] = useState({ file: null, name: "" });
  const [promoterPdf, setPromoterPdf] = useState({ file: null, name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('date', selectedDate);
    if (mainGluePdf) {
      formData.append('mainGluePdf', mainGluePdf.file);
      formData.append('mainGluePdfName', mainGluePdf.name);
    }
    if (promoterPdf) {
      formData.append('promoterPdf', promoterPdf.file);
      formData.append('promoterPdfName', promoterPdf.name);
    }
  
    axios.post('http://localhost:5000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      alert('Submission successful!');
      navigate('/');
    })
    .catch(error => {
      console.error('Error uploading files', error);
    })
    .finally(() => {
      setIsSubmitting(false); // Re-enable the button after submission
    });
  };

  return (
    <div className="flex flex-col items-center justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
      <p className="text-4xl font-bold mb-7">領料單輸入</p>
      <BasicDatePicker onChange={(newValue) => setSelectedDate(newValue)} />
      <div className="flex justify-center space-x-6 mt-6">
        <Upload label="主膠PDF" id="main-glue-pdf" onFileChange={(data) => setMainGluePdf(data)} />
        <Upload label="促進劑PDF" id="promoter-pdf" onFileChange={(data) => setPromoterPdf(data)} />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedDate || !mainGluePdf || !promoterPdf}
        className={`rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm mt-11 mb-11 ${!selectedDate || !mainGluePdf || !promoterPdf ? 'bg-indigo-400' : 'bg-indigo-500 hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'}`}
      >
        Upload
      </button>

    </div>
  );
}
