import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


export default function DailyMaterialDetail() {
  const { date } = useParams();
  const [dataDetails, setDataDetails] = useState(null);

  // Get the user's role from localStorage
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (date) {
      axios.get(`http://localhost:5000/get-material-detail/${date}`)
        .then(response => {
          setDataDetails(response.data);
          console.log('response daily',response.data);
        })
        .catch(error => {
          console.error('Error fetching details:', error);
        });
    }
  }, [date]);

  return (
    <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-2xl text-indigo-600 font-bold mb-10 mt-12">
        打料日期 {date}
      </p>
      

    </div>
  );
}
