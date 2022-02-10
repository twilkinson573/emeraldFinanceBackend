//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import "./EmeraldToken.sol";
import "./interfaces/beefy/IVaultV6.sol";

contract Lottery is Ownable {

  EmeraldToken _emer;
  IERC20[] _acceptedERC20s;
  address _yieldVaultAddress;

  constructor(address _emerAddress, address _initialYieldVaultAddress) {
    _emer = EmeraldToken(_emerAddress);
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


  // Deposits & Withdrawals ===================================================

  function makeDeposit(uint256 _amount) public {
    require(getAcceptedERC20(0).allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
    require(getAcceptedERC20(0).transferFrom(msg.sender, address(this), _amount), "Transfer failed");

    require(_emer.transfer(msg.sender, _amount * 100), "EMER Transfer failed");

    getAcceptedERC20(0).approve(_yieldVaultAddress, _amount);
    _depositToVault(_amount);
    // require(_depositToVault(_amount), "Deposit to vault failed");
  }

  function makeWithdrawal(uint256 _amount) public {
    // Todo - probably need some calculations to work out what proportions of our mooToken vault shares we need to cash in
    // require(_withdrawFromVault(_amount), "Withdraw from vault failed");
    _withdrawFromVault(_amount);
    require(_emer.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
    require(_emer.transferFrom(msg.sender, address(this), _amount * 100), "Transfer failed");

    require(getAcceptedERC20(0).transfer(msg.sender, _amount), "ERC20 Transfer failed");
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
