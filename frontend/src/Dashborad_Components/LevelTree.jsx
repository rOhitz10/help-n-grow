import React, { useEffect, useRef, useState } from 'react';
import { FaSearch, FaRedoAlt, FaUserCircle, FaArrowCircleRight, FaTimes } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { TailSpin } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';

const LevelCard = ({ node, onClick }) => {
  const { name, epin, children } = node;
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth);
    }
  };

  return (
    <div className="flex justify-center items-center border-2 shadow-lg py-2 cursor-pointer">
      {/* Parent Node */}
      <div className="flex flex-col justify-center items-center rounded-full p-2">
        <span className="flex justify-center items-center bg-green-500 text-white rounded-full p-4">
          <FaUserCircle size={40} />
        </span>
        <h2 className="text-center">{name}</h2>
        <p className="text-center">{epin}</p>
      </div>

      {/* Children Nodes with Scroll Buttons */}
      <div className="relative w-full md:min-w-56 mt-4">
        {showLeftButton && (
          <button
            className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 z-10"
            onClick={() => handleScroll(-200)}
          >
            <FaChevronLeft size={20} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scroll-smooth scrollbar-hide"
          onScroll={checkScroll}
        >
          <div className="flex flex-row space-x-4 px-4 py-2">
            {children.length > 0 ? (
              children.map((child) => (
                <div
                  className="flex flex-col justify-center items-center min-w-[120px]"
                  key={child._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(child);
                  }}
                >
                  <span className="flex justify-center items-center bg-green-400 text-white rounded-full p-4">
                    <FaUserCircle size={40} />
                  </span>
                  <h1 className="text-center">{child.name}</h1>
                  <h1 className="text-center">{child.epin}</h1>
                </div>
              ))
            ) : (
              <p className="text-gray-500 p-4">No children</p>
            )}
          </div>
        </div>

        {showRightButton && (
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow-md z-10"
            onClick={() => handleScroll(200)}
          >
            <FaChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

function LevelTree() {
  const [menuBar, setMenuBar] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const sidebarRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    setMenuBar((prev) => !prev); // Toggle the menuBar state
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/v1/get-grand-nodes', { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data.data || []);
      } catch (error) {
        console.error("Cannot fetch data", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, logout]);

  const countGrandChildren = (node) => {
    if (!node.children || node.children.length === 0) return 0;
    return node.children.reduce((count, child) => count + 1 + countGrandChildren(child), 0);
  };

  const filteredData = data.filter((node) =>
    node.epin.includes(searchQuery) ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.children && node.children.some((child) =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.epin.includes(searchQuery)
    ))
  );

  const openModal = (node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <TailSpin color="#00BFFF" height={80} width={80} />
      </div>
    );
  }
 
  return (
    <div className="flex min-h-screen">
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

      {/* Main Content */}
      <div className="flex-1 lg:ml-60">
        <button className="absolute m-4 rounded-full z-20 lg:hidden" onClick={handleClick}>
          <FaArrowCircleRight size={30} className={`transition-transform duration-300 ${menuBar ? 'hidden' : ''}`} />
        </button>

        <Header />

        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-8">Level Tree</h1>
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by epin or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center">
              <FaSearch className="inline mr-2" />
              Search
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center" onClick={() => setSearchQuery('')}>
              <FaRedoAlt className="inline mr-2" />
              Reset
            </button>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
              <div
                ref={modalRef}
                className="bg-white p-8 rounded-md shadow-lg w-11/12 md:w-96 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-open"
              >
                <button
                  className="absolute top-2 right-2 text-gray-500 text-2xl hover:text-gray-700"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
                <h2 className="text-2xl font-semibold mb-4">{selectedNode.name}</h2>
                <p><strong>Epin:</strong> {selectedNode.epin}</p>
                <p><strong>Children:</strong> {selectedNode.children ? selectedNode.children.length : 0}</p>
                <p><strong>Grandchildren:</strong> {countGrandChildren(selectedNode)}</p>

                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Children:</h3>
                    {selectedNode.children.map((child) => (
                      <div key={child._id} className="mt-2" onClick={(e) => { e.stopPropagation(); openModal(child); }}>
                        <p>Name: {child.name}</p>
                        <p>Epin: {child.epin}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {filteredData.map((node) => (
          <LevelCard key={node._id} node={node} grandChildCount={countGrandChildren(node)} onClick={openModal} />
        ))}
      </div>
    </div>
  );
}

export default LevelTree;