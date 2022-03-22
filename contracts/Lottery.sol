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

  struct LotteryTicketMeta {
    uint depositSize;
    uint depositDate;
  }

  // Mapping from owner to list of owned token IDs
  mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
  // Mapping from token ID to index of the owner tokens list
  mapping(uint256 => uint256) private _ownedTokensIndex;
  // Array with all token ids, used for enumeration
  uint256[] private _allTokens;
  // Mapping from token id to position in the allTokens array
  mapping(uint256 => uint256) private _allTokensIndex;
  // Mapping from token id to Ticket MetaData
  // TODO2 - remove public modifier (just for dev -> inspection)
  mapping(uint => LotteryTicketMeta) public lotteryTickets;


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

    uint256 newTicketId = _ticketIds.current();
    _mint(msg.sender, newTicketId);
    _ticketIds.increment();

    // Add metadata to new Ticket NFT
    lotteryTickets[newTicketId] = LotteryTicketMeta(_amount, block.timestamp);

    // TODO2 - Set external IPFS URI to external token metadata: image etc
    // _setTokenURI(newItemId, tokenURI);
  }

  function withdrawTicket(uint256 _tokenId) public {
    require(ownerOf(_tokenId) == msg.sender, "Incorrect owner attempting withdrawal");

    uint _depositSize = lotteryTickets[_tokenId].depositSize;
    _burn(_tokenId);

    uint totSup = IVaultV6(_yieldVaultAddress).totalSupply();
    console.log("Total Supply:");
    console.log(totSup);

    uint balance = IVaultV6(_yieldVaultAddress).balance();
    console.log("Balance:");
    console.log(balance);


    uint pricePerFullShare = IVaultV6(_yieldVaultAddress).totalSupply() == 0 ? 1 : IVaultV6(_yieldVaultAddress).balance() * 1e18 / (IVaultV6(_yieldVaultAddress).totalSupply());
    console.log("Price per full mooScreamUSDC share:");
    console.log(pricePerFullShare);

    uint _withdrawalShares = _depositSize / pricePerFullShare;

    console.log("Must return USDC:");
    console.log(_depositSize);
    console.log("Withdrawing shares:");
    console.log(_withdrawalShares);

    _withdrawFromVault(_withdrawalShares);
    require(getAcceptedWant(0).transfer(msg.sender, _depositSize), "Want Token Transfer failed");
  }


  // Yield Farming ============================================================

  function _depositToVault(uint256 _depositAmount) internal {
    IVaultV6(_yieldVaultAddress).deposit(_depositAmount);
  }

  function _withdrawFromVault(uint256 _withdrawalShares) internal {
    IVaultV6(_yieldVaultAddress).withdraw(_withdrawalShares);
  }


  // ERC721Enumerable =========================================================

  function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual returns (uint256) {
    require(index < balanceOf(owner), "ERC721Enumerable: owner index out of bounds");
    return _ownedTokens[owner][index];
  }

  function totalSupply() public view virtual returns (uint256) {
      return _allTokens.length;
  }

  function tokenByIndex(uint256 index) public view virtual returns (uint256) {
    require(index < totalSupply(), "ERC721Enumerable: global index out of bounds");
    return _allTokens[index];
  }

  /**
    * @dev Hook that is called before any token transfer. This includes minting
    * and burning.
    *
    * Calling conditions:
    *
    * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
    * transferred to `to`.
    * - When `from` is zero, `tokenId` will be minted for `to`.
    * - When `to` is zero, ``from``'s `tokenId` will be burned.
    * - `from` cannot be the zero address.
    * - `to` cannot be the zero address.
  */
  function _beforeTokenTransfer(
      address from,
      address to,
      uint256 tokenId
  ) internal virtual override {
      super._beforeTokenTransfer(from, to, tokenId);

      if (from == address(0)) {
          _addTokenToAllTokensEnumeration(tokenId);
      } else if (from != to) {
          _removeTokenFromOwnerEnumeration(from, tokenId);
      }
      if (to == address(0)) {
          _removeTokenFromAllTokensEnumeration(tokenId);
      } else if (to != from) {
          _addTokenToOwnerEnumeration(to, tokenId);
      }
  }

  /**
    * @dev Private function to add a token to this extension's ownership-tracking data structures.
    * @param to address representing the new owner of the given token ID
    * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
  */
  function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
    uint256 length = balanceOf(to);
    _ownedTokens[to][length] = tokenId;
    _ownedTokensIndex[tokenId] = length;
  }

  /**
    * @dev Private function to add a token to this extension's token tracking data structures.
    * @param tokenId uint256 ID of the token to be added to the tokens list
  */
  function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
    _allTokensIndex[tokenId] = _allTokens.length;
    _allTokens.push(tokenId);
  }

  /**
    * @dev Private function to remove a token from this extension's ownership-tracking data structures. Note that
    * while the token is not assigned a new owner, the `_ownedTokensIndex` mapping is _not_ updated: this allows for
    * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
    * This has O(1) time complexity, but alters the order of the _ownedTokens array.
    * @param from address representing the previous owner of the given token ID
    * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
  */
  function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
    // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
    // then delete the last slot (swap and pop).

    uint256 lastTokenIndex = balanceOf(from) - 1;
    uint256 tokenIndex = _ownedTokensIndex[tokenId];

    // When the token to delete is the last token, the swap operation is unnecessary
    if (tokenIndex != lastTokenIndex) {
        uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

        _ownedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
        _ownedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
    }

    // This also deletes the contents at the last position of the array
    delete _ownedTokensIndex[tokenId];
    delete _ownedTokens[from][lastTokenIndex];
  }

  /**
    * @dev Private function to remove a token from this extension's token tracking data structures.
    * This has O(1) time complexity, but alters the order of the _allTokens array.
    * @param tokenId uint256 ID of the token to be removed from the tokens list
  */
  function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
    // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
    // then delete the last slot (swap and pop).

    uint256 lastTokenIndex = _allTokens.length - 1;
    uint256 tokenIndex = _allTokensIndex[tokenId];

    // When the token to delete is the last token, the swap operation is unnecessary. However, since this occurs so
    // rarely (when the last minted token is burnt) that we still do the swap here to avoid the gas cost of adding
    // an 'if' statement (like in _removeTokenFromOwnerEnumeration)
    uint256 lastTokenId = _allTokens[lastTokenIndex];

    _allTokens[tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
    _allTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index

    // This also deletes the contents at the last position of the array
    delete _allTokensIndex[tokenId];
    _allTokens.pop();
  }

}
