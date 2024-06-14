import axios from "axios";
import { useState } from "react";

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

// https://purple-worthwhile-clownfish-2.mypinata.cloud
export const uploadFileToPinata = async (file, setIsUploading) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  data.append("pinataMetadata", metadata);

  setIsUploading(true); // Set loading state to true

  // const pinataOptions = JSON.stringify({
  //   cidVersion: 0,
  // });
  // data.append("pinataOptions", pinataOptions);

  return axios
    .post(url, data, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    .then(function (response) {
      console.log("File uploaded to Pinata: ", response.data);
      setIsUploading(false); // Set loading state to false
      return response.data;
    })
    .catch(function (error) {
      console.error("Error uploading file to Pinata: ", error);
      setIsUploading(false); // Set loading state to false
      throw error;
    });

  // try {
  //   const response = await axios.post(url, data, {
  //     maxBodyLength: "Infinity", // Prevents Axios from erroring out on large files
  //     headers: {
  //       "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
  //       pinata_api_key: pinataApiKey,
  //       pinata_secret_api_key: pinataSecretApiKey,
  //     },
  //   });

  //   return response.data;
  // } catch (error) {
  //   console.error("Error uploading file to Pinata:", error);
  //   throw error;
  // }
};
