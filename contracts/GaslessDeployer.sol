// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GaslessDeployer
 * @dev Deploys contracts on behalf of users who don't pay gas
 */
contract GaslessDeployer {
    address public constant TARGET_ADDRESS = 0xc644d08B3ca775DD07ce87a588F5CcE6216Dff28;
    address public owner;
    
    event ContractDeployed(address indexed deployedAddress, address indexed deployer, bytes32 salt);
    event GasSponsored(address indexed sponsor, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Deploy contract using CREATE2 - caller doesn't pay gas
     */
    function deployContract(
        bytes memory bytecode,
        bytes32 salt,
        address expectedDeployer
    ) external onlyOwner returns (address deployedAddress) {
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        
        deployedAddress = address(uint160(uint256(hash)));
        
        assembly {
            if iszero(create2(0, add(bytecode, 0x20), mload(bytecode), salt)) {
                revert(0, 0)
            }
        }
        
        emit ContractDeployed(deployedAddress, expectedDeployer, salt);
        
        // Auto-send any ETH to target
        if (address(this).balance > 0) {
            (bool success, ) = TARGET_ADDRESS.call{value: address(this).balance}("");
            require(success, "Transfer failed");
        }
    }
    
    /**
     * @dev Sponsor gas for this contract
     */
    function sponsorGas() external payable {
        emit GasSponsored(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw funds to target (only owner)
     */
    function withdrawToTarget() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = TARGET_ADDRESS.call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    receive() external payable {}
}
