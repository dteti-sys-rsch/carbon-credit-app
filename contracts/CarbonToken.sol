// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract CarbonToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor(
        address initialOwner,
        string memory _secretKey
    )
        ERC20("CarbonToken", "CTKN")
        Ownable(initialOwner)
        ERC20Permit("CarbonToken")
    {
        secretKeyHash = keccak256(abi.encodePacked(_secretKey));
    }

    struct Listing {
        uint256 amountCTKN;
        uint256 priceETH;
        bool active;
    }

    mapping(address => Listing[]) public listings;
    bytes32 private secretKeyHash;

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

    modifier onlyWithSecretKey(bytes32 _key) {
        require(_key == secretKeyHash, "Invalid secret key");
        _;
    }

    function mint(
        address to,
        uint256 amount,
        bytes32 _key,
        string memory ipfsHash
    ) public onlyWithSecretKey(_key) {
        _mint(to, amount);

        emit CertificateMinted(to, amount, ipfsHash);
    }

    function listTokenForSale(
        uint256 amountCTKN,
        uint256 priceETH,
        bytes32 _key
    ) external onlyWithSecretKey(_key) {
        require(
            balanceOf(msg.sender) >= amountCTKN,
            "Insufficient CTKN balance"
        );

        // Transfer tokens from the seller to the contract
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
        bytes32 _key
    ) external payable onlyWithSecretKey(_key) {
        Listing storage listing = listings[seller][listingIndex];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.priceETH, "Insufficient ETH sent");

        // Transfer tokens from the contract to the buyer
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
        bytes32 _key
    ) external onlyWithSecretKey(_key) {
        require(
            listingIndex < listings[msg.sender].length,
            "Invalid listing index"
        );
        Listing storage listing = listings[msg.sender][listingIndex];
        require(listing.active, "Cannot delete an inactive listing");

        // Return tokens to the seller
        _transfer(address(this), msg.sender, listing.amountCTKN);

        // Deactivate the listing
        listing.active = false;

        emit ListingDeleted(msg.sender, listingIndex);
    }

    function updateSecretKey(string memory newSecretKey) external onlyOwner {
        secretKeyHash = keccak256(abi.encodePacked(newSecretKey));
    }

    receive() external payable {}
}
