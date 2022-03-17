//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

import "./interfaces/beefy/IVaultV6.sol";

contract Lottery is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _ticketIds;

  IERC20[] _acceptedWants;
  address _yieldVaultAddress;

  constructor(address _initialYieldVaultAddress) ERC721("Emerald Ticket", "EMT") {
    _yieldVaultAddress = _initialYieldVaultAddress;
  }

  // #acceptedWant - ERC20 tokens we accept as deposits =======================

  function addAcceptedWant(address _newAddress) external onlyOwner {
    _acceptedWants.push(IERC20(_newAddress));
  }

  function getAcceptedWantsCount() public view returns(uint addressCount) {
    return _acceptedWants.length;
  } 

  function getAcceptedWant(uint _i) public view returns (IERC20) {
    return _acceptedWants[_i];
  }


  // User Deposits & Withdrawals ==============================================

  function makeDeposit(uint256 _amount) public {
    require(getAcceptedWant(0).allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
    require(getAcceptedWant(0).transferFrom(msg.sender, address(this), _amount), "Transfer failed");


    getAcceptedWant(0).approve(_yieldVaultAddress, _amount);
    _depositToVault(_amount);
    // require(_depositToVault(_amount), "Deposit to vault failed");

    // TODO1 - NFT ticket minting here
    _ticketIds.increment();
    uint256 newTicketId = _ticketIds.current();
    _mint(msg.sender, newTicketId);
    // _setTokenURI(newItemId, tokenURI);
  }

  function makeWithdrawal(uint256 _shares) public {
    // require(_withdrawFromVault(_amount), "Withdraw from vault failed");

    // TODO1 - NFT verifying / updating / destroying here

    // TODO2 - need a calculation to work out what proportion of IOU token to sell to cover user withdrawal
    _withdrawFromVault(_shares);
    

    require(getAcceptedWant(0).transfer(msg.sender, _shares), "Want Token Transfer failed");
  }


  // Yield Farming ============================================================

  function _depositToVault(uint256 _amount) internal {
    IVaultV6(_yieldVaultAddress).deposit(_amount);
  }

  function _withdrawFromVault(uint256 _shares) internal {
    IVaultV6(_yieldVaultAddress).withdraw(_shares);
  }

}
