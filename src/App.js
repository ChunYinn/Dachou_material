import { Route, Routes } from 'react-router-dom';
import Login from "./pages/login";
import Selection from "./pages/selection";
import NavBar from "./common/nav";

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
      </Routes>

    </div>
  );
}

export default App;
