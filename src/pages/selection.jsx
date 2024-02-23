import { ExclamationCircleIcon, ChartBarIcon, CubeIcon, InboxArrowDownIcon} from '@heroicons/react/24/outline'
import { BarChart } from '@mui/x-charts/BarChart';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


// Translation mapping for days of the week
const dayOfWeekMap = {
  'Monday': '週一',
  'Tuesday': '週二',
  'Wednesday': '週三',
  'Thursday': '週四',
  'Friday': '週五',
  'Saturday': '週六',
  'Sunday': '週日',
};


export default function Selection() {
  const [dataCardInfo, setDataCardInfo] = useState({
    notCollectedNo: 'Loading...',
    totalKgToday: 'Loading...',
    numberNeedingRestock: 'Loading...'
  });

  // Function to fetch data from the server using axios
  const fetchData = () => {
    axios.get('http://localhost:5000/get-data-card-info')
      .then(response => {
        console.log(response.data);
        // Assuming response.data is the object with your data
        setDataCardInfo({
          notCollectedNo: `${response.data.notCollectedNo} 筆`,
          totalKgToday: response.data.totalKgToday ? `${response.data.totalKgToday} kg` : "今日無打料",
          numberNeedingRestock: response.data.numberNeedingRestock ? `${response.data.numberNeedingRestock}` : "無需補貨化工"
        });
      })
      .catch(error => {
        console.error('Error fetching data from the server:', error);
        // Optionally update the state to indicate an error
        setDataCardInfo({
          notCollectedNo: 'Error',
          totalKgToday: 'Error',
          numberNeedingRestock: 'Error'
        });
      });
  };

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []); // The empty array ensures this effect runs only once after the initial render


  // Updated Data Card with dynamic data
  const stats = [
    { id: 1, name: '昨日未完成筆數', stat: dataCardInfo.notCollectedNo, icon: ExclamationCircleIcon, link: '/daily-collect' },
    { id: 2, name: '本日打料公斤數', stat: dataCardInfo.totalKgToday, icon: CubeIcon, link: '/assign' },
    { id: 3, name: '需補貨化工', stat: dataCardInfo.numberNeedingRestock, icon: InboxArrowDownIcon, link: '/chemical_list' },
  ];
  

  const [chartData, setChartData] = useState({
    rubData: [],
    silData: [],
    xLabels: [],
  });

  const fetchProductionData = () => {
    axios.get('http://localhost:5000/get-production-data')
      .then(response => {
        const rubData = [];
        const silData = [];
        const xLabels = [];
  
        response.data.forEach(item => {
          const dayOfWeek = dayOfWeekMap[item.day_of_week]; // Translate day of week
  
          // Convert production_date to a Date object and format it
          const dateObj = new Date(item.production_date);
          const formattedDate = `${dateObj.getMonth() + 1}-${dateObj.getDate()}`; // Format date as MM-DD
  
          xLabels.push(`${dayOfWeek} ${formattedDate}`); // Combine day and date
  
          rubData.push(item.rubber_kg);
          silData.push(item.silicone_kg);
        });
  
        setChartData({ rubData, silData, xLabels });
      })
      .catch(error => {
        console.error('Error fetching production data:', error);
      });
  };
  

  useEffect(() => {
    fetchProductionData();
  }, []);

  let rubDataNumeric = [];
  let silDataNumeric = [];

  if (chartData.xLabels.length > 0) {
    rubDataNumeric = chartData.rubData.map(item => parseFloat(item));
    silDataNumeric = chartData.silData.map(item => parseFloat(item));
  }

  return (
    
    <div className="flex flex-col mt-10 items-center h-screen" style={{ height: 'calc(100vh - 120px)' }}> 
        {/* Card Information */}
        <div className='w-full max-w-6xl'>
          {/* Data Card */}
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className="absolute rounded-md bg-indigo-500 p-3">
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                  
                  <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                    <a href={item.link} className="font-medium text-indigo-600 hover:text-indigo-500">
                      查看<span className="sr-only"> {item.name} stats</span>
                    </a>
                      
                    </div>
                    
                  </div>
                  
                </dd>
              </div>
            ))}
            
          </dl>
          {/* Chart Card */}
          <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">    
          <div className="p-5 relative overflow-hidden rounded-lg bg-white shadow sm:px-6">
            <dt className="pb-4">
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">一週每日打料公斤數</p>
            </dt>
            <dd className="ml-16 mb-4">
              <div style={{ width: '100%', height: 'auto', padding: '0 16px' }}>
              {chartData.xLabels.length > 0 && (
                <BarChart
                  width={500}
                  height={300}
                  series={[
                    { data: silDataNumeric, label: '矽膠', id: 'silId', stack: 'total' },
                    { data: rubDataNumeric, label: '橡膠', id: 'rubId', stack: 'total' },
                  ]}
                  xAxis={[
                    {
                      data: chartData.xLabels,
                      scaleType: 'band',
                      tooltipFormatter: (value) => value, // This ensures that X-axis tooltip displays the correct value
                    }
                  ]}
                />
              )}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
