import { useNavigate } from 'react-router-dom';

export default function Selection() {
  const navigate = useNavigate();

  // Navigation functions
  const navigateAssignMaterial = () => {
    navigate('/assign');
  };

  const navigateList = () => {
    navigate('/daily-collect');
  };

  const navigateMaterialSearch = () => {
    navigate('/material-search');
  };

  const navigateInventorySearch = () => {
    navigate('/inventory-search');
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen" style={{ height: 'calc(100vh - 120px)' }}> 
      <div className="flex justify-center items-center space-x-20 mb-6">
        {/* First row of buttons */}
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-64 h-32"
          onClick={navigateAssignMaterial}
        >
          領料單輸入
        </button>

        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-64 h-32"
          onClick={navigateList}
        >
          領料單查詢
        </button>
      </div>

      <div className="flex justify-center items-center space-x-20">
        {/* Second row of buttons */}
        <button
          type="button"
          className="rounded-md bg-gray-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 w-64 h-32"
          onClick={navigateMaterialSearch}
        >
          Material Search
        </button>

        <button
          type="button"
          className="rounded-md bg-gray-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 w-64 h-32"
          onClick={navigateInventorySearch}
        >
          Inventory Search
        </button>
      </div>
    </div>
  )
}
