//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./EmeraldToken.sol";

contract Lottery {

  EmeraldToken public emer;

  // pass EmeraldToken ERC20 address
  constructor(EmeraldToken _emerAddress) {
    emer = _emerAddress;
  }

  function makeDeposit(uint256 amount) public returns (string memory) {
    // console.log("Emerald tokens held by Lottery:", emer.balanceOf(msg.sender));
    // return emer.balanceOf(address(this));
    console.log(emer.name());
    return emer.name();

    // return _emer.totalSupply();
    // return _emer.totalSupply();

  }

}
