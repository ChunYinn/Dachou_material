import * as React from 'react';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PhotoIcon } from '@heroicons/react/24/solid';
import TextField from '@mui/material/TextField'; 

export function BasicDatePicker() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <DatePicker
          label="選擇日期"
          renderInput={(params) => <TextField {...params} />}
        />
      </div>
    </LocalizationProvider>
  );
}

export function Upload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
      const newFile = event.target.files[0];
      if (newFile) {
          const fileUrl = URL.createObjectURL(newFile);
          setFile(fileUrl);
      }
  };

  return (
      <div className="col-span-full mt-12 text-center"> {/* text-center class applied here */}
          <label htmlFor="file-upload" className="block text-xl font-semibold leading-6 text-gray-900">
              主膠PDF
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10" style={{ width: '400px' }}> {/* Inline style for width */}
              <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600"> {/* justify-center class applied here */}
                      <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                          <span>Upload a file</span>
                          <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="application/pdf"
                          />
                      </label>
                  </div>
                  <p className="text-xs leading-5 mb-7 text-gray-600">PDF up to 10MB</p>
                  {file && (
                      <iframe
                          src={file}
                          style={{ height: '500px', width: '100%' }}
                          frameBorder="0"
                          title="PDF preview"
                      ></iframe>
                  )}
              </div>
          </div>
      </div>
  );
}

export default function UploadPDF() {
  return (
    <div className="flex flex-col items-center justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
      <p className="text-4xl font-bold text-gray-900 mb-7">領料單輸入</p>
      <BasicDatePicker />
      <Upload />
    </div>
  );
}
