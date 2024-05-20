// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract CarbonToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor(
        address initialOwner
    )
        ERC20("CarbonToken", "CTKN")
        Ownable(initialOwner)
        ERC20Permit("CarbonToken")
    {
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function transferCTKNWithETHBack(
        address recipient,
        uint256 amountCTKN,
        uint256 amountETH
    ) external payable {
        require(
            address(this).balance >= amountETH,
            "Contract does not have enough ETH"
        );

        // Transfer CTKN tokens from sender to recipient
        _transfer(msg.sender, recipient, amountCTKN);

        // Ensure the recipient has approved the contract to spend ETH on their behalf
        (bool success, ) = recipient.call{value: amountETH}("");
        require(success, "Failed to send ETH back to sender");
    }

    // Define a struct to store listing details
    struct Listing {
        uint256 amountCTKN;
        uint256 priceETH;
        address seller;
    }

    // Mapping to store listings
    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    // Event to emit when a new listing is created
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint256 amountCTKN,
        uint256 priceETH
    );

    // Function to list CTKN for sale
    function listCTKNForSale(uint256 amountCTKN, uint256 priceETH) external {
        require(balanceOf(msg.sender) >= amountCTKN, "Insufficient balance");
        require(amountCTKN > 0 && priceETH > 0, "Invalid listing parameters");

        // Transfer CTKN tokens to contract
        transfer(address(this), amountCTKN);

        // Store the listing details
        listings[nextListingId] = Listing(amountCTKN, priceETH, msg.sender);
        emit ListingCreated(nextListingId, msg.sender, amountCTKN, priceETH);
        nextListingId++;
    }

    // Function to buy CTKN from a listing
    function buyCTKNFromListing(
        uint256 listingId,
        uint256 priceETH
    ) external payable {
        Listing storage listing = listings[listingId];
        require(listing.amountCTKN > 0, "Listing not found");
        require(msg.value >= priceETH, "Insufficient ETH sent");

        // Transfer CTKN to buyer
        transfer(msg.sender, listing.amountCTKN);

        // Transfer ETH to seller
        payable(listing.seller).transfer(priceETH);

        // Remove the listing
        delete listings[listingId];
    }

    // Function to allow contract to receive ETH
    receive() external payable {}
}
