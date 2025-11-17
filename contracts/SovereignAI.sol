// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SovereignAI
 * @dev Example smart contract for Sovereign AI Unlimited testing
 */
contract SovereignAI {
    address public constant TARGET_ADDRESS = 0xc644d08B3ca775DD07ce87a588F5CcE6216Dff28;
    
    mapping(address => uint256) public contributions;
    uint256 public totalValueTransferred;
    
    event ValueTransferred(address indexed from, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Transfer value to target address
     */
    function transferToTarget() external payable {
        require(msg.value > 0, "Must send value");
        require(address(this).balance >= msg.value, "Insufficient balance");
        
        (bool success, ) = TARGET_ADDRESS.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        contributions[msg.sender] += msg.value;
        totalValueTransferred += msg.value;
        
        emit ValueTransferred(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
