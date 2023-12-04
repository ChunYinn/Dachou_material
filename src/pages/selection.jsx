import { useNavigate } from 'react-router-dom';

export default function Selection() {
  const navigate = useNavigate();

  const navigateUploadPDF = () => {
    navigate('/upload');
  };

  const navigateList = () => {
    navigate('/list');
  };

  return (
    <div className="flex justify-center items-center h-screen" style={{ height: 'calc(100vh - 120px)' }}> 

      <div className="flex justify-center items-center space-x-20">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-2xl font-s font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-64 h-32"
          onClick={navigateUploadPDF}
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
    </div>
  )
}
