import React, { useState } from "react";
import { connectToEthereum } from "../utils/Logic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateSecretKey = () => {
  const [newSecretKey, setNewSecretKey] = useState("");

  const handleUpdateSecretKey = async (e) => {
    e.preventDefault();
    if (!newSecretKey) {
      toast.warn("Please provide a new secret key");
      return;
    }

    try {
      // Connect to the contract
      if (window.ethereum) {
        const { token } = await connectToEthereum();

        // Update the secret key
        const tx = await token.updateSecretKey(newSecretKey);
        await tx.wait();
        toast.success("Secret key updated successfully");
      }
    } catch (error) {
      toast.error(
        <div>
          Updating secret key failed <br />
          {error.message}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center p-10 bg-red-500 text-white rounded-2xl shadow-lg w-full max-w-md mt-10">
      <ToastContainer />
      <div className="text-xl font-bold mb-4 text-center">
        Update Secret Key
      </div>
      <form
        onSubmit={handleUpdateSecretKey}
        className="flex flex-col items-center space-y-4 w-full"
      >
        <input
          type="text"
          placeholder="New Secret Key"
          value={newSecretKey}
          onChange={(e) => setNewSecretKey(e.target.value)}
          className="p-2 border border-gray-400 rounded w-full text-black"
        />
        <button
          type="submit"
          className="p-2 bg-yellow-500 text-white rounded w-full"
        >
          Update Secret Key
        </button>
      </form>
    </div>
  );
};

export default UpdateSecretKey;
