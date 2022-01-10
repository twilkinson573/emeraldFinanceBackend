//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import "./EmeraldToken.sol";

contract Lottery is Ownable {

  EmeraldToken emer;
  IERC20[] acceptedERC20s;

  constructor(EmeraldToken _emerAddress) {
    emer = _emerAddress;
  }

  // #acceptedERC20 ======================================================

  function addAcceptedERC20(address newAddress) external onlyOwner {
    acceptedERC20s.push(IERC20(newAddress));
  }

  function getAcceptedERC20sCount() public view returns(uint addressCount) {
    return acceptedERC20s.length;
  } 

  function getAcceptedERC20(uint i) public view returns (IERC20) {
    return acceptedERC20s[i];
  }


  // Deposits ============================================================

  function makeDeposit(uint256 amount) public {


    console.log("HELLO", getAcceptedERC20(0).totalSupply());
    console.log("Bob usdc:", getAcceptedERC20(0).balanceOf(msg.sender));
    // Currently throws: 'ERC20: transfer amount exceeds balance'
    // getAcceptedERC20(0).transfer(address(this), amount);
    console.log("Bob usdc:", getAcceptedERC20(0).balanceOf(msg.sender));

    // give them EMER in return
    emer.transfer(msg.sender, amount);

  }

}


// 1. Make Lottery Ownable
// 2. Add a state data structure to store the appropriate ERC20 addresses that we accept (for now just USDC but this makes it possible to add more in future)
  // we need an #addAcceptedToken too
  // we don't need a struct to hold 
// 3, Create a dummy interface for an ERC20 token (or just use IERC20 pre-made from OpenZep??)
// 4. Accept that ERC20 token in #makeDeposit (do we have to get allowance? Check Sushi code/tutorals)
// 5. For now just return 1 EMER per cent (in future use Chainlink oracle to get actual price and return 1 EMER per cent of other assets)

// ?a. How to we give different reciepts per different ERC20 supplied? In future we'd need different EMER receipt tokens or something
