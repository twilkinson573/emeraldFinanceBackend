# Emerald Finance ❇️

## La Historia

* I heard the 2 sentence idea of Pool Together as an ad on a podcast and as an experiment I did no research and tried to build a project inspired by that core tokenomic idea completely from my own first principles - discovering issues, solutions, mechanics etc along the way without being influenced by what was already out there

* So the core tokenomic loop is kinda like the PoolTogether model
    * It’s a riskless lottery, you have the chance of winning the lottery prize but get all your entry money back at the end and cannot lose money
    * You as a user deposit funds, the protocol generates yield with all those funds and selects a winner every x days to pay the entire pot to a randomly selected winner
    * You can withdraw your initial funds at any point

## Rationale

* It’s a bit of fun & gamification, but there is a real rationale:
* If you are a regular user with small amounts of funds sitting idle in your wallet (say $78 in USDC), it’s dead money and doing absolutely nothing - but there’s no real point in yield farming with that amount, even at high APRs you are only going to produce trivial amounts of return (eg. $7.80 for a year at 10% on your $78, assuming you leave it farming for a year & the farm stays alive etc!)
    * Especially when you factor in the gas of 3+ transactions to actually put that capital to work and claim rewards, even on a low cost chain like FTM
    * Especially because the actual power of having these stables in your wallet is the opportunity/ability they give you to rapidly invest in a new token/protocol on-chain if the chance comes your way, without waiting to load up and bridge from fiat CEX etc. So these funds likely won’t be left alone for a year, they’re your dry powder waiting to be used in between trades or investments
    * Hence there’s even less point farming with them since you really won’t be producing anything non-trivial, and going too degen in search of non-trivial yields is way too risky and time-consuming
* So the alternative: park that dry powder in Emerald Finance and have a chance at winning an outsized rewards pot, delivered as USDC directly into your wallet
    * It’s a plus EV play, park it there as long as you need while the money isn’t being used and if you don’t win anything you’ve only spent a few cents on gas, but the potential upside is winning a large non-trivial amount of money with nothing to lose because your principle is always withdrawable (of course the regular smart contract risk applies like with everything)
* This rationale makes sense ‘for the masses’, so whale protection is a big concern:
    * There’s a $1000 hard deposit limit for whale protection so this is truly a democratised lottery for the masses of frogs out there
    * Also having it on a low cost chain like FTM


## Hardhat Stuff

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
