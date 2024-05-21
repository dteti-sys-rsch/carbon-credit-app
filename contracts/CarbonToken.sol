// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract CarbonToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    struct Listing {
        address seller;
        uint256 amountCTKN;
        uint256 priceETH;
        bool active;
    }

    // Mapping from seller address to their listings
    mapping(address => Listing[]) public listings;

    event TokenListed(
        address indexed seller,
        uint256 amountCTKN,
        uint256 priceETH
    );
    event TokenPurchased(
        address indexed buyer,
        address indexed seller,
        uint256 amountCTKN,
        uint256 priceETH
    );

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

    function listTokenForSale(uint256 amountCTKN, uint256 priceETH) external {
        require(
            balanceOf(msg.sender) >= amountCTKN,
            "Insufficient CTKN balance"
        );
        listings[msg.sender].push(
            Listing({
                seller: msg.sender,
                amountCTKN: amountCTKN,
                priceETH: priceETH,
                active: true
            })
        );
        emit TokenListed(msg.sender, amountCTKN, priceETH);
    }

    function buyToken(address seller, uint256 listingIndex) external payable {
        Listing storage listing = listings[seller][listingIndex];
        require(listing.active, "Listing is not active");
        require(listing.priceETH == msg.value, "Incorrect ETH amount sent");
        require(
            balanceOf(listing.seller) >= listing.amountCTKN,
            "Seller does not have enough CTKN"
        );

        // Transfer CTKN tokens from seller to buyer
        _transfer(listing.seller, msg.sender, listing.amountCTKN);

        // Transfer ETH from buyer to seller
        payable(listing.seller).transfer(listing.priceETH);

        // Mark the listing as inactive
        listing.active = false;
        emit TokenPurchased(
            msg.sender,
            seller,
            listing.amountCTKN,
            listing.priceETH
        );
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

    // Function to allow contract to receive ETH
    receive() external payable {}
}
