import { Route, Routes } from "react-router-dom";
import AdminDashboard from './components/amin/adminDashboard';

import LoginPage from "./pages/login/login";
import SignupPage from "./pages/login/signup";
import ManagerDashboard from "./components/manager/managerDashboard";
import UserDashboard from "./components/user/userDashboard";
import Adashboard from "./pages/admin/Adashboard";
import TimeLinePage from "./pages/admin/TimeLinePage";
import BoardPage from "./pages/admin/BoardPage";
import TeamsPage from "./pages/admin/TeamsPage";
import TasksPage from "./pages/admin/TasksPage";
import Asummary from "./pages/admin/Asummary";
import GeneralChat from "./pages/GeneralChat";
import { useEffect, useState } from "react";
import UserDetails from "./components/amin/userDetails";

function App() {
  
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="register" element={<SignupPage />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}

      {/* Admin Routes with nested children */}
      <Route path="/admin/dashboard" element={<AdminDashboard />}/>
      <Route path="/admin/chat" element={<GeneralChat/>}/>
      <Route path="/admin/users/:id" element={<UserDetails/>}/>
        
    

      {/* Other role dashboards */}
      <Route path="/manager/dashboard" element={<ManagerDashboard />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/user/chat" element={<GeneralChat/>}/>

<Route path='/admin/projects/:projectId' element={<Adashboard />} >
<Route index element={<Asummary />} /> {/* default child */}
        <Route path="timeline" element={<TimeLinePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="teams" element={<TeamsPage />} />
        </Route>
   
       {/* user side  */}
   <Route path='/user/projects/:projectId' element={<Adashboard />} >
<Route index element={<Asummary />} /> {/* default child */}
        <Route path="timeline" element={<TimeLinePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="teams" element={<TeamsPage />} />
        </Route>
    
   
   
    </Routes>



  );
}


export default App;