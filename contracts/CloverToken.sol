pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EmeraldToken is ERC20 {

  constructor(uint256 initialSupply) ERC20("EmeraldToken", "EML") {
    _mint(msg.sender, initialSupply);
  } 

}
