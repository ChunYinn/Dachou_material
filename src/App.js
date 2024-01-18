import React, { useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Login from "./pages/login";
import Selection from "./pages/selection";
import NavBar from "./common/nav";
import MaterialAssign from './pages/material_assign';
import MaterialByDate from './pages/daily_material_collect';
import DailyMaterialDetail from './pages/daily_material_detail';
import MaterialSearchAdd from './pages/material_search_add';
import InventorySearch from './pages/inventory_search';

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
            <Route path="/assign" element={<MaterialAssign />} />
            <Route path="/material-search" element={<MaterialSearchAdd />} />
            <Route path='/inventory-search' element={<InventorySearch />} />
          </>
        )}

        {/* Routes available for all logged-in users */}
        {!isManager && (
          <Route path="/" element={<MaterialByDate />} />
        )}

        <Route path="/daily-collect" element={<MaterialByDate />} />    
        <Route path="/details/:date" element={<DailyMaterialDetail />} />

        {/* Redirect non-manager users trying to access manager-only routes */}
        {!isManager && isLoggedIn && (
          <Route path="*" element={<Navigate to="/daily-collect" replace />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
