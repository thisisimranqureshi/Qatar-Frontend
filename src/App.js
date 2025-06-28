import "./App.css";
import ProtectedRoute from "./compponents/ProtectedRoute";
import AdminRoute from "./compponents/AdminRoute";
import Login from "./compponents/Login";
import Home from "./compponents/Home";
import Signup from "./compponents/Signup";
import AddCompany from "./compponents/AddCompany";
import ManagerRoute from "./compponents/ManagerRoute";
import RevenueCategoryInput from "./compponents/RevenueCategoryInput";
import Dashboard from "./compponents/Dashboard";
import Sidebar from "./compponents/Sidebar";
import Accounts from "./compponents/Accounts";
import ExpenseSubCategoryInput from "./compponents/ExppenseSubCategoryInput";
import ExpenseCategoryInput from "./compponents/ExpenseCategoryInput";
import RevenueSubCategory from "./compponents/RevenueSubCategory";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useState } from "react";
import TypeSelection from "./compponents/Typeselection";

const LayoutWithSidebar = ({ children }) => {
  const location = useLocation();
  const noSidebarRoutes = ["/", "/login"];
  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div style={{ display: "flex" }}>
      {shouldShowSidebar && <Sidebar />}
      <div className="main-content" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  const [companies, setCompanies] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  return (
    <BrowserRouter>
      <LayoutWithSidebar>
        <Routes>
          <Route path="/signup" element={<Signup setUserEmail={setUserEmail} setUserName={setUserName} />} />
          <Route path="/" element={<Login setUserEmail={setUserEmail} setUserName={setUserName} setUserRole={setUserRole} />} />
          <Route path="/type-selection/:id" element={<ProtectedRoute><TypeSelection /></ProtectedRoute>} />
          <Route path="/company/:id/revenue-subcategory" element={<ProtectedRoute><RevenueSubCategory /></ProtectedRoute>} />
          <Route path="/company/:id/revenue-category" element={<ProtectedRoute><RevenueCategoryInput /></ProtectedRoute>} />
          <Route path="/company/:id/expense-category" element={<ProtectedRoute><ExpenseCategoryInput /></ProtectedRoute>} />
          <Route path="/company/:id/expense-subcategory" element={<ProtectedRoute><ExpenseSubCategoryInput /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><AdminRoute><Accounts/></AdminRoute></ProtectedRoute>}/>
          <Route path="/home" element={<ProtectedRoute><Home companies={companies} /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/add-company"
            element={<ProtectedRoute><ManagerRoute><AddCompany setCompanies={setCompanies} userEmail={userEmail} userName={userName} /></ManagerRoute></ProtectedRoute>}
          />
        </Routes>
      </LayoutWithSidebar>
    </BrowserRouter>
  );
}

export default App;
