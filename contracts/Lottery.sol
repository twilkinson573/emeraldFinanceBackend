//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "./EmeraldToken.sol";

contract Lottery {

  EmeraldToken public emer;

  // pass EmeraldToken ERC20 address
  constructor(EmeraldToken _emerAddress) {
    emer = _emerAddress;
  }

  function makeDeposit(uint256 amount) public returns (string memory) {
    // TODO - add logic to give user some EMER tokens (for now for free, later we add payment in USDC)
    emer.transfer(msg.sender, amount);
    return emer.name();
  }

}
