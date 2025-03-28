import  { useEffect, useState, useRef } from 'react';
import { BsShieldLock } from 'react-icons/bs';
import { FaArrowCircleRight, FaArrowCircleLeft } from 'react-icons/fa'; // Added FaArrowCircleLeft
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../AuthContext';
import { TailSpin } from 'react-loader-spinner';

const DashHome = () => {
  const { logout } = useAuth();

  const [data, setData] = useState({
    totalCount: 0,
    referrals: 0,
    epins: 0,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [menuBar, setMenuBar] = useState(false);
  const sponsorId = localStorage.getItem('epin');
  const sidebarRef = useRef(null);

  const handleClick = () => {
    setMenuBar(!menuBar);
  };

  const handleOutsideClick = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setMenuBar(false)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const fetchData = async () => {
    if (sponsorId) {
      try {
        const response = await axios.get("/api/v1/count-all-downline", {
          params: { sponsorId },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        
        const res = await axios.get("/api/v1/count-all-direct-downline", {
          params: { sponsorId },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const ans = await axios.get("/api/v1/total-epins",{
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        })
        
        // Set the data in one go to prevent multiple state updates
        setData({
          totalCount: response.data.totalCount,
          referrals: res.data.totalCount,
          epins: ans.data.count,  
        });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          logout();
        }
        setError(`Error fetching data: ${error.response ? error.response.data.message : error.message}`);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sponsorId]);

  // Loading and error handling
 if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <TailSpin color="#00BFFF" height={80} width={80} />
      </div>
    );
  }
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-60 transition-transform duration-300 ease-in-out transform lg:translate-x-0 ${menuBar ? 'translate-x-0' : '-translate-x-full'} lg:static lg:w-60`}
      >
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Toggle Button */}
        <button
          aria-label="Toggle sidebar"
          className={`absolute m-4 lg:hidden rounded-full z-20 ${menuBar ? 'hidden' : ''}`}
          onClick={handleClick}
        >
          {menuBar ? (
            <FaArrowCircleLeft size={30} className="text-gray-600" />
          ) : (
            <FaArrowCircleRight size={30} className="text-gray-600" />
          )}
        </button>

        {/* Dashboard Container */}
        <div className="p-8 m-12">
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-700">
              Admin Dashboard
            </h1>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">TOTAL USERS</h2>
                <span className="text-xl font-semibold">{data.totalCount}</span>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-500">
                👥
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">ACTIVE USERS</h2>
                <span className="text-xl font-semibold">{data.totalCount}</span>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-500">
                👥
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">REFERRALS</h2>
                <span className="text-xl font-semibold">{data.referrals}</span>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-500">
                👤
              </div>
            </div>
          </div>

          {/* Epin Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">EPINS</h2>
                <span className="text-xl font-semibold">{data.epins}</span>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-500">
                <BsShieldLock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashHome;
