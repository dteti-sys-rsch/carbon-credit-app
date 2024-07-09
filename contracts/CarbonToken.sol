// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract CarbonToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 private authorizedMessage;

    constructor(
        address initialOwner
    )
        ERC20("CarbonToken", "CTKN")
        Ownable(initialOwner)
        ERC20Permit("CarbonToken")
    {
        authorizedMessage = keccak256("skripsi_mufidus_sani");
    }

    struct Listing {
        uint256 amountCTKN;
        uint256 priceETH;
        bool active;
    }

    mapping(address => Listing[]) public listings;

    event TokenListed(
        address indexed seller,
        uint256 amountCTKN,
        uint256 priceETH,
        uint256 listingIndex
    );
    event TokenPurchased(
        address indexed buyer,
        address indexed seller,
        uint256 amountCTKN,
        uint256 priceETH,
        uint256 listingIndex
    );
    event ListingDeleted(address indexed seller, uint256 listingIndex);
    event CertificateMinted(
        address indexed account,
        uint256 amount,
        string ipfsHash
    );

    function updateAuthorizedMessage(
        string memory newMessage
    ) external onlyOwner {
        authorizedMessage = keccak256(bytes(newMessage));
    }

    modifier onlyWithSignature(bytes memory signature) {
        bytes32 messageHash = authorizedMessage.toEthSignedMessageHash();
        address signer = messageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");
        _;
    }

    function mint(
        address to,
        uint256 amount,
        string memory ipfsHash,
        bytes memory signature
    ) public onlyWithSignature(signature) {
        _mint(to, amount);
        emit CertificateMinted(to, amount, ipfsHash);
    }

    function listTokenForSale(
        uint256 amountCTKN,
        uint256 priceETH,
        bytes memory signature
    ) external onlyWithSignature(signature) {
        require(
            balanceOf(msg.sender) >= amountCTKN,
            "Insufficient CTKN balance"
        );
        _transfer(msg.sender, address(this), amountCTKN);
        listings[msg.sender].push(
            Listing({amountCTKN: amountCTKN, priceETH: priceETH, active: true})
        );
        emit TokenListed(
            msg.sender,
            amountCTKN,
            priceETH,
            listings[msg.sender].length - 1
        );
    }

    function buyToken(
        address seller,
        uint256 listingIndex,
        bytes memory signature
    ) external payable onlyWithSignature(signature) {
        Listing storage listing = listings[seller][listingIndex];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.priceETH, "Insufficient ETH sent");
        _transfer(address(this), msg.sender, listing.amountCTKN);
        payable(seller).transfer(msg.value);
        listing.active = false;
        emit TokenPurchased(
            msg.sender,
            seller,
            listing.amountCTKN,
            listing.priceETH,
            listingIndex
        );
    }

    function deleteListing(
        uint256 listingIndex,
        bytes memory signature
    ) external onlyWithSignature(signature) {
        require(
            listingIndex < listings[msg.sender].length,
            "Invalid listing index"
        );
        Listing storage listing = listings[msg.sender][listingIndex];
        require(listing.active, "Cannot delete an inactive listing");
        _transfer(address(this), msg.sender, listing.amountCTKN);
        listing.active = false;
        emit ListingDeleted(msg.sender, listingIndex);
    }

    receive() external payable {}
}
