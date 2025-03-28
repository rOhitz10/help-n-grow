import axios from 'axios';
import { useState,useRef,useEffect } from 'react';
import Sidebar from '../Sidebar';
import { FaArrowCircleRight } from 'react-icons/fa';
import Header from '../Header';
import { jwtDecode } from 'jwt-decode';





function SendRequest() {
  const sidebarRef = useRef(null);
  const [menuBar, setMenuBar] = useState(false);
  const [showErr, setShowErr] = useState('');
  const [view, setView] = useState(false);
  const [financialDetails, setFinancialDetails] = useState(null);
  const token = localStorage.getItem('token');
  const [sendData, setSendData] = useState(null);
  // const [sendError, setSendError] = useState(null);
  
  const receiverId = sendData?._id || null;
  const epin = sendData?.epin || ''; // Ensure epin exists before usage
  
  const [level, setLevel] = useState(null);
  
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLevel(decoded.level); // Store level in state
      } catch (error) {
          console.error("Failed to decode token:", error);
        }
      }
    }, [token]);
    
    const levelToAmount = {
      0: "1000",
      1: "1300",
      2: "2500",
      3: "5000",
      4: "10000",
      5: "20000",
      6: "40000",
      7: "80000",
      8: "160000",
      9: "320000",
    };
    const getAmountByLevel = (userLevel) => {
      return levelToAmount[userLevel] || "0"; // Default if level not found
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


useEffect(() => {
  const fetchSendData = async () => {
    try {
      const ans = await axios.get('/api/v1/get-user-for-request', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (ans.data.data.length > 0 ) {
        setSendData(ans.data.data[0]); 
      } else {
        setSendData(ans.data.data); 
      }
      console.log(ans.data.data.length ,"idddd");
      
      // setSendError(null); // Reset error state on success
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Please try again.';
      // setSendError(errorMessage);
      console.error(errorMessage);
      
    }
  };
  fetchSendData();
}, [])




  const handleView = async () => {
    try {
      const response = await axios.get(
        "/api/v1/get-financial-detail",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            epin: epin
          }
        }
      );
      setFinancialDetails(response.data);
      setView(true);
    } catch (error) {
      console.error("Cannot fetch financial detail", error);
      setShowErr('Unable to fetch financial details.');
    }
  };

  const fetch = async () => {
    if (!token) {
      setShowErr('Authorization token is missing. Please log in again.');
      return;
    }

    try {
      await axios.post(
        "/api/v1/send-request",
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowErr('Request sent successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Request failed. Please try again.';
      setShowErr(errorMessage);
      console.error('Error while sending request:', error);
    }
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setView(false);
    }
  };

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

    <div className="border-2 border-red-400 rounded-lg m-8 p-6 text-center">
              <h2 className="text-xl font-semibold text-red-500">Send Help</h2>
              <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full">
                Send Link Available
              </button>
              {/* {sendError ? (
                <div className="text-red-500 bg-red-100 text-center p-2 m-4">{sendError}</div>
                ) : (
                  sendData && <SendRequest sendData={sendData} />
                  )} */}
    <div className="flex flex-col items-center justify-start m-8 transition-all duration-300">
      {showErr && (
        <div className="text-red-500 bg-red-100 text-center p-2 m-4">{showErr}</div>
      )}
      <div className=" items-center justify-between p-4 mb-4 bg-white shadow hover:shadow-red-400 rounded-lg transition-all duration-300 hover:shadow-md sm:flex">
        <input
          placeholder={sendData ? sendData.name : "No user for send request"}
          readOnly
          className="w-full p-2 font-bold text-blue-200"
          />

          <div className="flex">
        <button
          className="flex items-center mx-2 px-3 py-1 text-sm font-medium text-green-600 border border-green-500 rounded hover:bg-green-500 hover:text-white transition"
          onClick={fetch}
          >
          Send
        </button>
        <button
          className="flex items-center mx-2 px-3 py-1 text-sm font-medium text-red-600 border border-red-500 rounded hover:bg-red-500 hover:text-white transition"
          onClick={handleView}
          >
          View
        </button>
            </div>

      </div>

      {view && (
        <div
        className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
        onClick={closeModal}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg relative max-w-md w-full">
            <button
              onClick={() => setView(false)}
              className="absolute top-2 right-2 text-lg text-gray-600"
              >
              ✖
            </button>
            <h2 className="text-2xl font-semibold mb-4">Details for {sendData?.name}</h2>
            <p><strong>Amount:</strong> {getAmountByLevel(level)}</p>
            <p><strong>Receiver ID:</strong> {sendData?._id}</p>
            <p><strong>Email:</strong> {sendData?.email}</p>
            <p ><strong>Mobile:</strong> {financialDetails.phoneNumber}</p>

            {financialDetails && (
              <div className="mt-4">
                <p className='my-2'><strong>Financial Details:</strong></p>
                <p><strong>AccountHolderName:</strong> {financialDetails.financialDetails.accountHolderName}</p>
                <p><strong>AccountNumber:</strong> {financialDetails.financialDetails.accountNo}</p>
                <p><strong>Bank Name:</strong> {financialDetails.financialDetails.bankName}</p>
                <p><strong>GooglePay:</strong> {financialDetails.financialDetails.googlePay}</p>
                <p><strong>IFSC Code:</strong> {financialDetails.financialDetails.ifscCode}</p>
                <p><strong>PhonePe:</strong> {financialDetails.financialDetails.phonePe}</p>

                <ul>
                  {financialDetails.transactions?.map((tx, index) => (
                    <li key={index}>
                      {tx.date} - {tx.amount}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
      </div>
      </div>
      </div>
  );
}

export default SendRequest;
