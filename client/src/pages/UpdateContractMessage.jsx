import { useEffect, useState } from "react";
import { connectToEthereum } from "../utils/Logic";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateContractMessage = ({ setAccount }) => {
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const { account } = await connectToEthereum();
        setAccount(account);
      } catch (error) {
        toast.error(error.message);
      }
    };
    init();
  });

  const updateMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Authorized message cannot be empty");
      return;
    }

    try {
      const { token, signer, account } = await connectToEthereum();
      setAccount(account);
      const contractWithSigner = token.connect(signer);
      const tx = await contractWithSigner.updateAuthorizedMessage(newMessage);
      await tx.wait();
      toast.success("Authorized message updated successfully!");
      setNewMessage("");
    } catch (error) {
      if (
        error.reason ===
        `Error: VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")'`
      ) {
        toast.error(
          <div>
            Can't update secret message.
            <br />
            You are not the owner of the contract.
          </div>
        );
      } else {
        toast.error(error.reason);
      }
    }
  };

  return (
    <div className="container mx-auto px-12 py-8 md:px-20">
      <ToastContainer />
      <div className="mt-10 flex flex-col items-center">
        <input
          type="text"
          placeholder="New Authorized Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="mb-4 p-2 border border-gray-700 rounded"
        />
        <button
          onClick={updateMessage}
          className="bg-[#254336] p-3 rounded-lg text-white"
        >
          Update Authorized Message
        </button>
      </div>
    </div>
  );
};

export default UpdateContractMessage;
