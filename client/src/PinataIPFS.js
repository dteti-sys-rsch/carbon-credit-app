import axios from "axios";

const pinataApiKey = "de429acc2a5dde4b7010";
const pinataSecretApiKey =
  "c657ee5d8687ada73178f4814895b37643a7950c523aeed87f337cd7008c7e92";

// https://purple-worthwhile-clownfish-2.mypinata.cloud
export const uploadFileToPinata = async (file) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  data.append("pinataMetadata", metadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", pinataOptions);

  try {
    const response = await axios.post(url, data, {
      maxBodyLength: "Infinity", // Prevents Axios from erroring out on large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
};
