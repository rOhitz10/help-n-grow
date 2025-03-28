import { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FaArrowCircleRight } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import {jwtDecode} from 'jwt-decode';
import { TailSpin } from 'react-loader-spinner';

const DashHome = () => {
  const { logout } = useAuth();
  const sidebarRef = useRef(null);

  // State for general data, send data, receive data, loading/error states
  const [data, setData] = useState({
    totalCount: 0,
    referrals: 0,
    epins: 0,
    currentStatus: 'Pending',
  });
  const [activeUsers, setActiveUser] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copy, setCopy] = useState(false);
  const [menuBar, setMenuBar] = useState(false);
  const sponsorId = localStorage.getItem('epin');
  const textToCopy = `http://localhost:8000/r/signup/${sponsorId}`;
  const [status,setStatus] = useState(false);
  const token = localStorage.getItem('token');

   useEffect(() => {
      if (token) {
       
        try {
          const decoded = jwtDecode(token);
  
          if(decoded.status === true){
            setStatus("Active");
          }
          else{
            setStatus("Deactive")
          }
        }  catch (error) {
          console.error("Failed to decode token:", error);
        }
      }
    }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopy(true);
      setTimeout(() => setCopy(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard', error);
    }
  };

  // Handle menu bar toggling
  const handleClick = () => setMenuBar(!menuBar);

  const handleOutsideClick = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setMenuBar(false); // Close the sidebar if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Fetch general data (downline, active users, etc.)
  const fetchData = async () => {
    if (sponsorId) {
      try {
        const response = await axios.get('/api/v1/count-all-downline', {
          params: { sponsorId },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        setData(response.data);

        const res = await axios.get('/api/v1/count-all-direct-downline', {
          params: { sponsorId },
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        setActiveUser(res.data.totalCount);
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
 


  // UseEffect to fetch data when component mounts
  useEffect(() => {
    fetchData();
    
  }, []);

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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 w-60 h-screen bg-white z-30 transition-transform duration-300 ease-in-out transform ${
          menuBar ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar />
      </div>

      {/* Overlay for Mobile */}
      {menuBar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={handleClick} // Close sidebar when clicking outside
        />
      )}
      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        <button
          className={`absolute m-4 lg:hidden rounded-full z-20 ${menuBar ? 'hidden' : ''}`}
          onClick={handleClick}
        >
          <FaArrowCircleRight size={30} className="transition-transform duration-300" />
        </button>

        <Header />

        {copy && <div className="absolute top-22 w-full flex justify-center items-center h-12 bg-green-200"><h1 className="text-2xl text-green-600">Copied!</h1></div>}

        <div className="p-8">
          {/* Referral Link Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="text-sm ml-8">
              <label className="block text-gray-500">My Referral Link:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={sponsorId}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full"
                />
                <button
                  className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={handleCopy}
                >
                  {copy ? '✅' : '📋'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">TOTAL USERS</h2>
                <span className="text-xl font-semibold">{data.totalCount}</span>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-500">👥</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">ACTIVE USERS</h2>
                <span className="text-xl font-semibold">{activeUsers}</span>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-500">👥</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">REFERRALS</h2>
                <span className="text-xl font-semibold">{activeUsers}</span>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-500">👤</div>
            </div>
          </div>

          {/* Epin Cards */}
          <div className="grid grid-cols-1  gap-6">
            {/* <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-500">EPINS</h2>
                <span className="text-xl font-semibold">{data.epins}</span>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-500">
                <BsShieldLock />
              </div>
            </div> */}

            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <h2 className="text-sm text-gray-500">CURRENT STATUS</h2>
              <span className="text-xl font-semibold text-blue-500">{status}</span>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default DashHome;
