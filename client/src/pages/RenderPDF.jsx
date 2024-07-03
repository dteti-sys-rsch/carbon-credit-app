import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MyDocument from "../components/MyDocument"; // Ensure this import points to where your MyDocument component is defined

const RenderPDF = () => {
  const [recipient, setRecipient] = useState("");

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <input
        type="text"
        placeholder="Enter company's name"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <PDFDownloadLink
        document={<MyDocument recipient={recipient} />}
        fileName={`certificate_${recipient}.pdf`}
      >
        {({ blob, url, loading, error }) => (
          <div className="bg-green-500 p-4 text-white rounded">
            {loading ? "Loading document..." : "Download Certificate"}
          </div>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export default RenderPDF;
