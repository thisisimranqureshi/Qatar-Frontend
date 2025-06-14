import './App.css';
import Login from './compponents/Login';
import Home from './compponents/Home';
import Signup from './compponents/Signup';
import AddCompany from './compponents/AddCompany';
import CompanyDetails from './compponents/Companydetail';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import { useState } from 'react';

function App() {
  const [companies,setCompanies]=useState([])
  return (
    <div>
     <BrowserRouter>
     <Routes>
      <Route path='/' element={<Signup/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home companies={companies} />}/>
      <Route path='/add-company' element={<AddCompany setCompanies={setCompanies} />}/>
      <Route path="/company/:id" element={<CompanyDetails />} />

     </Routes>
     </BrowserRouter>

    </div>
  );
}

export default App;
