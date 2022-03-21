// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Implementation of a vault to deposit funds for yield optimizing.
 * This is the contract that receives funds and that users interface with.
 * The yield optimizing strategy itself is implemented in a separate 'Strategy.sol' contract.
 */
contract VaultV6Mock is ERC20, Ownable {

    IERC20 public wantToken;

    /**
     * @dev Sets the value of {wantToken} to the token that the vault will
     * hold as underlying value
     * Initializes the vault's own 'moo' token.
     * This mooToken is minted when someone does a deposit. It is burned in order
     * to withdraw the corresponding portion of the underlying assets.
     * @param _name the name of the vault mooToken.
     * @param _symbol the symbol of the vault mooToken.
     * @param _wantToken manual setting of our USDC address for the want token
     */
    constructor (
        string memory _name,
        string memory _symbol,
        address _wantToken 
    ) ERC20(
        _name,
        _symbol
    ) {
      wantToken = IERC20(_wantToken);
    }

    /**
     * @dev - {want} in Beefy vocabulary is the underlying token the strategy accepts as a deposit
     * So in some cases it will be an LP token, in others it will be an singular asset, such as USDC
     * In the case of our mock here we can make it just take our USDC address
    */

    function want() public view returns (IERC20) {
        return wantToken;
    }

    /**
     * @dev Calculates the total underlying value of {token} held by the system.
     * It takes into account the vault contract balance, the strategy contract balance
     *  and the balance deployed in other contracts as part of the strategy.
     */
    function balance() public view returns (uint) {
        return want().balanceOf(address(this));
    }

    /**
     * @dev Function for various UIs to display the current value of one of our yield tokens.
     * Returns an uint256 with 18 decimals of how much underlying asset one vault share represents.
     */
    function getPricePerFullShare() public view returns (uint256) {
        return totalSupply() == 0 ? 1e18 : (balance() * 1e18) / (totalSupply());
    }

    /**
     * @dev The entrypoint of funds into the system. People deposit with this function
     * into the vault. The vault is then in charge of sending funds into the strategy.
     */
    function deposit(uint _amount) public {
        uint256 _pool = balance();
        want().transferFrom(msg.sender, address(this), _amount);
        uint256 _after = balance();
        _amount = _after - _pool; // Additional check for deflationary tokens
        uint256 shares = 0;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply()) / _pool;
        }
        _mint(msg.sender, shares);
    }

    /**
     * @dev A helper function to call withdraw() with all the sender's funds.
     */
    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    /**
     * @dev Function to exit the system. The vault will withdraw the required tokens
     * from the strategy and pay up the token holder. A proportional number of IOU
     * tokens are burned in the process.
     */
    function withdraw(uint256 _shares) public {
        uint256 r = (balance() * _shares) / totalSupply();
        _burn(msg.sender, _shares);
        require(want().transfer(msg.sender, r), "Withdraw failed");
    }
}
