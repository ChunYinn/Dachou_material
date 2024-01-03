import React, { useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Login from "./pages/login";
import Selection from "./pages/selection";
import NavBar from "./common/nav";
import ListPDFs from './pages/list_all';
import UploadPDF from './pages/pdf_upload';
import EmployeeList from './pages/list_employ';
import PDFDetail from './pages/pdf_detail';
import MaterialAssign from './pages/material_assign';
import MaterialByDate from './pages/daily_material_collect';

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
  const userRole = localStorage.getItem('userRole');

  // Check if the user is a manager
  const isManager = userRole === 'manager';

  // Redirect to login if not logged in
  if (!isLoggedIn && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {location.pathname !== '/login' && <NavBar />}
      
      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* Manager-only routes */}
        {isManager && (
          <>
            <Route path="/" element={<Selection />} />
            <Route path="/list" element={<ListPDFs />} />
            <Route path="/upload" element={<UploadPDF />} />
            <Route path="/assign" element={<MaterialAssign />} />
            <Route path="/daily-collect" element={<MaterialByDate />} />
          </>
        )}

        {/* Routes available for all logged-in users */}
        {!isManager && (
          <Route path="/" element={<EmployeeList />} />
        )}

        <Route path="/employee" element={<EmployeeList />} />
        <Route path="/pdf/:pdfId" element={<PDFDetail />} />

        {/* Redirect non-manager users trying to access manager-only routes */}
        {!isManager && isLoggedIn && (
          <Route path="*" element={<Navigate to="/employee" replace />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
