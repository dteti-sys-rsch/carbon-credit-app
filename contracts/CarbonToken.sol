// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract CarbonToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    struct Listing {
        uint256 amountCTKN;
        uint256 priceETH;
        bool active;
        string ipfsHash;
    }

    mapping(address => Listing[]) public listings;
    string private secretKey;

    event TokenListed(
        address indexed seller,
        uint256 amountCTKN,
        uint256 priceETH,
        uint256 listingIndex,
        string ipfsHash
    );

    event TokenPurchased(
        address indexed buyer,
        address indexed seller,
        uint256 amountCTKN,
        uint256 priceETH,
        uint256 listingIndex,
        string ipfsHash
    );

    event ListingDeleted(address indexed seller, uint256 listingIndex);

    constructor(
        address initialOwner,
        string memory _secretKey
    )
        ERC20("CarbonToken", "CTKN")
        Ownable(initialOwner)
        ERC20Permit("CarbonToken")
    {
        secretKey = _secretKey;
    }

    modifier onlyWithSecretKey(string memory _key) {
        require(
            keccak256(abi.encodePacked(_key)) ==
                keccak256(abi.encodePacked(secretKey)),
            "Invalid secret key"
        );
        _;
    }

    function mint(
        address to,
        uint256 amount,
        string memory _key
    ) public onlyWithSecretKey(_key) {
        _mint(to, amount);
    }

    function listTokenForSale(
        uint256 amountCTKN,
        uint256 priceETH,
        string calldata ipfsHash,
        string memory _key
    ) external onlyWithSecretKey(_key) {
        require(
            balanceOf(msg.sender) >= amountCTKN,
            "Insufficient CTKN balance"
        );

        // Transfer tokens from the seller to the contract
        _transfer(msg.sender, address(this), amountCTKN);

        listings[msg.sender].push(
            Listing({
                amountCTKN: amountCTKN,
                priceETH: priceETH,
                active: true,
                ipfsHash: ipfsHash
            })
        );

        emit TokenListed(
            msg.sender,
            amountCTKN,
            priceETH,
            listings[msg.sender].length - 1,
            ipfsHash
        );
    }

    function buyToken(
        address seller,
        uint256 listingIndex,
        string memory _key
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
            listingIndex,
            listing.ipfsHash
        );
    }

    function deleteListing(
        uint256 listingIndex,
        string memory _key
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

    receive() external payable {}
}
