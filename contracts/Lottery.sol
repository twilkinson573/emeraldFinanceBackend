//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import "./interfaces/beefy/IVaultV6.sol";

contract Lottery is ERC20, Ownable {

  IERC20[] _acceptedERC20s;
  address _yieldVaultAddress;

  // Create Emer token inline
  constructor(address _initialYieldVaultAddress) ERC20("EmeraldToken", "EMER") {
    _yieldVaultAddress = _initialYieldVaultAddress;
  }


  // #acceptedERC20 ===========================================================

  function addAcceptedERC20(address _newAddress) external onlyOwner {
    _acceptedERC20s.push(IERC20(_newAddress));
  }

  function getAcceptedERC20sCount() public view returns(uint addressCount) {
    return _acceptedERC20s.length;
  } 

  function getAcceptedERC20(uint _i) public view returns (IERC20) {
    return _acceptedERC20s[_i];
  }


  // User Deposits & Withdrawals ==============================================

  function makeDeposit(uint256 _amount) public {
    require(getAcceptedERC20(0).allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
    require(getAcceptedERC20(0).transferFrom(msg.sender, address(this), _amount), "Transfer failed");

    _mint(msg.sender, _amount);
    // require(_mint(msg.sender, _amount), "EMER minting failed");

    getAcceptedERC20(0).approve(_yieldVaultAddress, _amount);
    _depositToVault(_amount);
    // require(_depositToVault(_amount), "Deposit to vault failed");
  }

  function makeWithdrawal(uint256 _shares) public {
    // require(_withdrawFromVault(_amount), "Withdraw from vault failed");

    // Todo - need a calculation to work out what proportion of IOU token to sell to cover user withdrawal
    _withdrawFromVault(_shares);
    
    // require(_emer.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
    _burn(msg.sender, _shares);
    // require(_burn(msg.sender, _amount), "Emer burning failed");

    require(getAcceptedERC20(0).transfer(msg.sender, _shares), "ERC20 Transfer failed");
  }


  // Yield Farming ============================================================

  function _depositToVault(uint256 _amount) internal {
    IVaultV6(_yieldVaultAddress).deposit(_amount);
  }

  function _withdrawFromVault(uint256 _shares) internal {
    IVaultV6(_yieldVaultAddress).withdraw(_shares);
  }

}


// ?a. How to we give different reciepts per different ERC20 supplied? In future we'd need different EMER receipt tokens or something
