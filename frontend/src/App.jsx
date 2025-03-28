import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import About from './Components/About';
import Contact from './Components/Contact';
import Plan from './Components/Plan';
import SignIn from './Components/SignIn';
import SignUp from './Components/SignUp';
import ReferalSignUp from './Components/ReferalSignup';
import DashHome from './Dashborad_Components/DashHome';
import LevelTree from './Dashborad_Components/LevelTree';
import MyTeam from './Dashborad_Components/MyTeam';
import MyEpins from './Dashborad_Components/MyEpins';
import Profile from './Dashborad_Components/Profile';
import FinancialInfo from './Dashborad_Components/FinancialInfo';
import Admin_DashHome from './Admin_Dashboard/Admin_DashHome';
import AdminLevel from './Admin_Dashboard/AdminLevel';
import GenerateEpin from './Admin_Dashboard/GenerateEpin';
import { PrivateRoutes, AdminRoute } from './PrivateRoutes';
import SendRequest from './Dashborad_Components/Sub_component/SendRequest'
import ReceiveRequest from './Dashborad_Components/Sub_component/ReceiveRequest';
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import UpdateProfile from './Dashborad_Components/updateProfile';
import NotFoundPage from './utils/NotFoundPage';

function App() {
  return (
    <>
      {/* <Navbar /> */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="plan.pdf" element={<Plan />} />
        <Route path="contact" element={<Contact />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="r/signup/:sponsorEpin" element={<ReferalSignUp/>} />
        <Route path="forgot/password" element={<ForgotPassword/>}/>
        <Route path="reset/password/:token" element={<ResetPassword/>} />

        <Route path="*" element={<NotFoundPage />} />

        {/* Protected User Dashboard Routes */}
        <Route element={<PrivateRoutes />}>
          <Route path="/dashboard" element={<DashHome />} />
          <Route path="/dashboard/leveltree" element={<LevelTree />} />
          <Route path="/dashboard/myteam" element={<MyTeam />} />
          <Route path="/dashboard/myepins" element={<MyEpins />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/financial-info" element={<FinancialInfo />} />

          <Route path="/dashboard/recive/help" element={<ReceiveRequest/>} />
          <Route path="/dashboard/send/help" element={<SendRequest/>}/>
          <Route path="/dashboard/update-profile" element={<UpdateProfile/>}/>
        </Route>

        {/* Protected Admin Dashboard Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<Admin_DashHome />} />
          <Route path="/admin/level" element={<AdminLevel />} />
          <Route path="/generate/epin" element={<GenerateEpin />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
