// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IVaultV6  {
  function balance() external view returns (uint);
  function deposit(uint) external; 
  function withdrawAll() external; 
  function withdraw(uint256) external; 
}
