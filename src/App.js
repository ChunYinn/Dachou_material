import { Route, Routes } from 'react-router-dom';
import Login from "./pages/login";
import Selection from "./pages/selection";
import NavBar from "./common/nav";
import ListPDFs from './pages/list_all';
import UploadPDF from './pages/pdf_upload';

function App() {
  const appStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  };

  return (
    <div style={appStyle}>
      {/* <Login /> */}
      <NavBar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Selection />} />
        <Route path="/list" element={<ListPDFs />} />
        <Route path="/upload" element={<UploadPDF />} />
      </Routes>

    </div>
  );
}

export default App;
