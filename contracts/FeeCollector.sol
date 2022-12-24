// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract FeeCollector{

    //Setting default values
    address public owner ;
    uint public balance = 0;
    event Tsx();
    //Setting owner to the address which launches the contract
    constructor() public{
        owner = msg.sender;
    }

    //Fee collecter
    receive() payable external {
        balance += msg.value;
        emit Tsx();
    }

    //Withdraw function
    function withdraw(uint amount, address payable destAddr) public {
        require(msg.sender == owner, "Only owner can withdraw !");
        require(amount<=balance, "Not enough balance to complate this tsx");
        destAddr.transfer(amount);
        balance-=amount;
        emit Tsx();
    }
}