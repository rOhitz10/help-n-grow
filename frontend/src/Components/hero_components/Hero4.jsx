import React, { useState, useEffect } from "react";
import { FaAirbnb } from "react-icons/fa";

import Avatar from 'react-avatar';


const Card = ({ icon, title, description }) => {
  const [isHovered, setisHovered] = useState(false);

  const handleMouseOver = () => {
    setisHovered(true);
  };

  const handleMouseOut = () => {
    setisHovered(false);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 rounded-md bg-[#F7F2ED] shadow-lg transition-all duration-300 ease-in-out ${
        isHovered ? "scale-105" : "scale-100"
      }`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100">
        {icon}
      </div>
      <h3 className="mt-6 text-2xl font-bold text-gray-800">{title}</h3>
      <p className="mt-2 text-gray-600 text-center">{description}</p>
    </div>
  );
};

function Hero4(){
  return (
    <div className=" text-white min-h-screen p-8">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-black">Help'n'Groww</h1>
        <p className="text-lg mb-8 text-black">
        Connects people
and businesses with cuttingedge solutions, offering a
network that spans continents.
Build your path to success
globally.
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
          Discover Enterprise
        </button>
      </div>
      <div className="container mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card
          icon={<Avatar src="https://media.istockphoto.com/id/1320811419/photo/head-shot-portrait-of-confident-successful-smiling-indian-businesswoman.jpg?s=612x612&w=0&k=20&c=bCUTB8vd8MnzZFIq-x645-SmLNk2sQzOvOvWCPGDfZ4=" size="70" round={true} />}
          title="Sophia Bennett"
          description=" Go transformed my
life, giving me financial
freedom and luxury rewards.
It’s the ultimate platform for
anyone looking to succeed!"
        />
        <Card
         icon={<Avatar src="https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg" size="70" round={true} />}
          title="kyle redson"
          description="With Help'n'groww’s trust and
innovative system, I achieved
more than I ever imagined.
It’s the perfect partner for
building your dream lifestyle!"
        />
        <Card
     icon={<Avatar src="https://www.shutterstock.com/image-photo/headshot-portrait-smiling-african-american-600nw-1667439898.jpg" size="70" round={true} />}
          title="Christee"
          description=" gave me the
opportunity to lead, earn,
and grow like never before.
It’s truly a life-changing
experience for anyone
willing to dream big."
        />
        <Card
        icon={<Avatar src="https://www.shutterstock.com/image-photo/profile-picture-smiling-successful-young-260nw-2040223583.jpg" size="70" round={true} />}
          title="bruce antonyo"
          description="Access luxury perks and exclusive benefits
as you expand your network influence."
        />
      </div>
   
    </div>
  );
};

export default Hero4;