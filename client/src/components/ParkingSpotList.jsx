import React, { useEffect, useState } from "react";
import axios from "axios";
import Popup from "./Popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import SpringModal from "./SpringModal"; // Import SpringModal
import { useNavigate } from "react-router-dom";

const ParkingSpotList = () => {
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch the parking spots initially
  const fetchSpots = async () => {
    try {
      const response = await axios.get(
        "https://parkme-serverside.onrender.com/api/spots"
      );
      setSpots(response.data);
    } catch (error) {
      console.error("Error fetching spots:", error);
    }
  };

  // Set up long polling to listen for new entries
  const startLongPolling = async () => {
    try {
      const response = await axios.get(
        "https://parkme-serverside.onrender.com/api/notify",
        {
          timeout: 0, // Ensure the connection stays open until the server responds
        }
      );

      // Once the server sends the notification (when a new entry is made)
      const newSpot = response.data.spot;
      if (newSpot) {
        setSpots((prevSpots) => [...prevSpots, newSpot]);
      }

      // Re-initiate long polling after receiving a response
      startLongPolling();
    } catch (error) {
      console.error("Error in long polling:", error);
      // Retry the polling if it fails
      startLongPolling();
    }
  };

  useEffect(() => {
    fetchSpots();
    startLongPolling(); // Start long polling to get real-time updates
  }, []);

  const handleButtonClick = (spot) => {
    setSelectedSpot(spot);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedSpot(null);
  };

  const openDeleteModal = (spotId) => {
    setSpotToDelete(spotId);
    setIsModalOpen(true);
  };

  const handleDeleteSpot = async () => {
    try {
      await axios.delete(
        `https://parkme-serverside.onrender.com/api/spots/${spotToDelete}`
      );
      setSpots((prevSpots) =>
        prevSpots.filter((spot) => spot._id !== spotToDelete)
      );
      setIsModalOpen(false);
      setSpotToDelete(null);
      navigate("/"); // Redirect to the home page
    } catch (error) {
      console.error("Error deleting spot:", error);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {spots.map((spot) => (
        <div
          key={spot.slotNumber}
          className={`flex flex-col items-center bg-black/50 rounded-3xl shadow-lg p-6 w-64 transform transition-all duration-300 ${
            spot.occupied ? "opacity-100" : "hover:scale-105"
          }`}
        >
          <div className="text-center">
            <h3 className="text-xl font-medium text-white">
              Slot {spot.slotNumber}
            </h3>
            <p className="mt-2 text-sm text-gray-200">
              {spot.occupied ? "Occupied" : "Available"}
            </p>
            <p className="mt-1 text-sm text-white font-semibold">
              Registered on:{" "}
              {new Date(spot.registrationDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-6 w-full">
            <FontAwesomeIcon
              icon={faX}
              onClick={() => openDeleteModal(spot._id)} // Open delete confirmation modal
              className="text-red-900 cursor-pointer w-4 h-4 -mt-2 mb-3 hover:text-red-700 text-lg font-bold rounded-full border-2 border-red-500 p-2"
              size="xl"
            />
            <button
              className="w- px-6 py-2.5 text-center text-black bg-white border-2 border-white rounded-full text-sm hover:bg-transparent hover:text-white transition duration-200"
              onClick={() => handleButtonClick(spot)}
            >
              {spot.occupied ? "View Details" : "Reserve Now"}
            </button>
          </div>
        </div>
      ))}

      {/* Add the animated tailwind style to Popup */}
      {isPopupOpen && (
        <Popup
          className="h-[30px] transition-all transform duration-500 ease-in-out scale-100 opacity-100" // Add animation here
          spot={selectedSpot}
          onClose={closePopup}
        />
      )}

      {/* Render SpringModal for delete confirmation */}
      <SpringModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onConfirm={handleDeleteSpot} // Pass the delete function
        message="Are you sure you want to end this parking spot?"
      />
    </div>
  );
};

export default ParkingSpotList;
