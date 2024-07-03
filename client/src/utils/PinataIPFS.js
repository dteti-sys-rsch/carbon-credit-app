import axios from "axios";

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

export const uploadFileToPinata = async (file, setIsUploading) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  data.append("pinataMetadata", metadata);

  setIsUploading(true);

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
      setIsUploading(false);
      return response.data; // Return the full response data
    })
    .catch(function (error) {
      setIsUploading(false);
      throw error;
    });
};

export const deleteFileFromPinata = async (hash, setIsDeleting) => {
  const url = `https://api.pinata.cloud/pinning/unpin/${hash}`;

  setIsDeleting(true);

  return axios
    .delete(url, {
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    .then(function (response) {
      console.log("File deleted from Pinata: ", response.data);
      setIsDeleting(false);
    })
    .catch(function (error) {
      console.error("Error deleting file from Pinata: ", error);
      setIsDeleting(false);
      throw error;
    });
};
