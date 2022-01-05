//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "./EmeraldToken.sol";

contract Lottery {

  EmeraldToken private _emer;

  constructor() {
  // constructor(EmeraldToken _emer) {
    // _emer = ;
  }

  function checkHisBalance() public view returns (uint) {
    console.log(msg.sender);
    return _emer.balanceOf(msg.sender);
    // return _emer.totalSupply();
    // return _emer.totalSupply();

  }

}
