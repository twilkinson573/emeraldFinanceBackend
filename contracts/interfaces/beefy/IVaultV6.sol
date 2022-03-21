// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IVaultV6  {
  function balance() external view returns (uint);
  function getPricePerFullShare() external view returns (uint); 
  function deposit(uint256) external; 
  function withdraw(uint256) external; 
  function withdrawAll() external; 
}
