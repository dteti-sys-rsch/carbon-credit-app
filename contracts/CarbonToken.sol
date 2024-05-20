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

    // Function to allow contract to receive ETH
    receive() external payable {}
}
