import './App.css';
import Login from './compponents/Login';
import Home from './compponents/Home';
import Signup from './compponents/Signup';
import AddCompany from './compponents/AddCompany';
import CompanyDetails from './compponents/Companydetail';
import Sidebar from './compponents/Sidebar';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';

// Layout wrapper to hide sidebar on login/signup
const LayoutWithSidebar = ({ children }) => {
  const location = useLocation();
  const noSidebarRoutes = ['/', '/login'];

  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div style={{ display: 'flex' }}>
      {shouldShowSidebar && <Sidebar />}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  const [companies, setCompanies] = useState([]);

  return (
    <BrowserRouter>
      <LayoutWithSidebar>
        <Routes>
          <Route path='/' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/home' element={<Home companies={companies} />} />
          <Route path='/add-company' element={<AddCompany setCompanies={setCompanies} />} />
          <Route path="/company/:id" element={<CompanyDetails />} />
        </Routes>
      </LayoutWithSidebar>
    </BrowserRouter>
  );
}

export default App;
