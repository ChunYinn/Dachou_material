import { useState } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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

export default function MaterialByDate() {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
      <p className="text-4xl font-bold mb-7">領料單查看</p>
      <BasicDatePicker onChange={(newValue) => setSelectedDate(newValue)} />
      {/* Additional content can be added here */}
    </div>
  );
}
