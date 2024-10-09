# Carbon Credit App

## Overview
The Carbon Credit App is a blockchain-based platform that facilitates the issuance, transfer, and management of carbon credits using smart contracts. This project leverages decentralized technology to enhance transparency and traceability in the carbon credit ecosystem, ensuring that credits are only issued to legitimate projects and used correctly.

## Features
- Issuance of Carbon Credits: Allows projects to issue tokenized carbon credits once approved.
- Transfer of Credits: Users can securely transfer carbon credits between accounts.
- Smart Contracts: Automated validation and processing of carbon credits through smart contracts.
- Transparency: Full traceability of carbon credits across their lifecycle on the blockchain.

## Prerequisites
Before getting started, ensure you have the following installed:  
- Node.js
- Hardhat
- Solidity (Smart contract language)
- A supported wallet like MetaMask for testing blockchain interactions.

## Getting Started
1. Clone the Repository
```
git clone https://github.com/dteti-sys-rsch/carbon-credit-app.git
cd carbon-credit-app
```
2. Install Dependencies
```
npm install
```
3. Run Hardhat Locally
```
npx hardhat node
```
4. Compile Smart Contracts
```
npx hardhat compile
```
5. Deploy Smart Contracts
```
npx hardhat run scripts/deploy.js --network localhost
```
6. Set .env variables for 
```
API_URL="YOUR_SECRET_API_URL" // network set
PRIVATE_KEY="YOUR_ACCOUNT_ADDRESS" // address account
SECRET_MESSAGE="YOUR_SECRET_MESSAGE" // authentication key
```
7. Install React Application Dependencies
```
cd client
npm install
```
8. Set .env variables for React App
```
REACT_APP_PINATA_API_KEY="YOUR PINATA API KEY"
REACT_APP_PINATA_SECRET_API_KEY="YOUR PINATA SECRET API KEY"
REACT_APP_SECRET_MESSAGE="YOUR_SECRET_MESSAGE" // authentication key
REACT_APP_TOKEN_ADDRESS="YOUR_CONTRACT_ADDRESS" // address contract
REACT_APP_EXPECTED_NETWORK_ID="YOUR_NETWORK_ID" // network
```
9. Run the React Application
```
npm start
```
10. Start interacting with access in http://localhost:3000

## Project Structure
- contracts/: Contains Solidity smart contracts.
- scripts/: Deployment and management scripts for the contracts.
- test/: Automated test files for the smart contracts.
- src/: Front-end application files.
- artifacts/: Compiled contract output files.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue to discuss proposed changes.

## License
This project is licensed under the MIT License