import Login from "./pages/login";

function App() {
  const appStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  };

  return (
    <div style={appStyle}>
      <Login />
    </div>
  );
}

export default App;
