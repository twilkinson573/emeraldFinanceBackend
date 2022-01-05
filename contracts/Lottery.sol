//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lottery {

  IERC20 public emer;

  // pass EmeraldToken ERC20 address
  constructor(address _emerAddress) {
    emer = IERC20(_emerAddress);
  }

  function makeDeposit(uint256 amount) public returns (uint256) {
    // console.log("Emerald tokens held by Lottery:", emer.balanceOf(msg.sender));
    return emer.balanceOf(msg.sender);

    // return _emer.totalSupply();
    // return _emer.totalSupply();

  }

}
