//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmeraldToken is ERC20, Ownable {

  constructor(uint256 initialSupply) ERC20("EmeraldToken", "EMER") {
    _mint(msg.sender, initialSupply);
  } 

}
