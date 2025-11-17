const { ethers } = require('ethers');
const logger = require('./utils/logger');

class GACInteraction {
    constructor() {
        this.provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f');
        this.wallet = new ethers.Wallet('b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5', this.provider);
        
        // GAC Token Contract ABI (minimal ERC20 interface)
        this.gacAbi = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)"
        ];
        
        this.gacContract = new ethers.Contract(
            '0x0C9516703F0B8E6d90F83d596e74C4888701C8fc',
            this.gacAbi,
            this.wallet
        );
        
        this.targetAddress = '0xc644d08B3ca775DD07ce87a588F5CcE6216Dff28';
    }

    async getGACInfo() {
        try {
            const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
                this.gacContract.name(),
                this.gacContract.symbol(),
                this.gacContract.decimals(),
                this.gacContract.totalSupply(),
                this.gacContract.balanceOf(this.wallet.address)
            ]);

            return {
                name,
                symbol,
                decimals: parseInt(decimals),
                totalSupply: ethers.formatUnits(totalSupply, decimals),
                balance: ethers.formatUnits(balance, decimals),
                walletAddress: this.wallet.address,
                contractAddress: this.gacContract.target
            };
        } catch (error) {
            logger.error('Failed to get GAC token info', { error: error.message });
            throw error;
        }
    }

    async transferGAC(amount, toAddress = this.targetAddress) {
        try {
            const decimals = await this.gacContract.decimals();
            const amountInWei = ethers.parseUnits(amount.toString(), decimals);
            
            logger.info(`Transferring ${amount} GAC to ${toAddress}`);
            
            const tx = await this.gacContract.transfer(toAddress, amountInWei);
            const receipt = await tx.wait();
            
            logger.info('GAC transfer successful', {
                amount,
                to: toAddress,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
            });
            
            return receipt;
        } catch (error) {
            logger.error('GAC transfer failed', { error: error.message });
            throw error;
        }
    }

    async getETHBalance() {
        try {
            const balance = await this.provider.getBalance(this.wallet.address);
            return ethers.formatEther(balance);
        } catch (error) {
            logger.error('Failed to get ETH balance', { error: error.message });
            throw error;
        }
    }

    async transferETH(amount, toAddress = this.targetAddress) {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            
            logger.info(`Transferring ${amount} ETH to ${toAddress}`);
            
            const tx = await this.wallet.sendTransaction({
                to: toAddress,
                value: amountInWei,
                gasLimit: 21000
            });
            
            const receipt = await tx.wait();
            
            logger.info('ETH transfer successful', {
                amount,
                to: toAddress,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
            });
            
            return receipt;
        } catch (error) {
            logger.error('ETH transfer failed', { error: error.message });
            throw error;
        }
    }

    async simulateJob1Trading() {
        // Simulate Job 1: Trade unlisted GAC tokens
        try {
            const gacInfo = await this.getGACInfo();
            logger.info('GAC Token Information', gacInfo);
            
            // Simulate trading logic
            if (parseFloat(gacInfo.balance) > 1000) {
                // Transfer small amount to target
                await this.transferGAC(1000);
                return { success: true, transferred: 1000, currency: 'GAC' };
            }
            
            return { success: false, reason: 'Insufficient GAC balance' };
        } catch (error) {
            logger.error('Job 1 simulation failed', { error: error.message });
            return { success: false, error: error.message };
        }
    }
}

module.exports = GACInteraction;

tasks/task3/gac_contract.txt

# GAC TOKEN CONTRACT DETAILS
CONTRACT_ADDRESS=0x0C9516703F0B8E6d90F83d596e74C4888701C8fc
TOKEN_NAME=Gamercoin
TOKEN_SYMBOL=GAC
DECIMALS=18
STARTING_BALANCE=798999986.99

# WALLET DETAILS
OWNER_PUBLIC=0xc644d08B3ca775DD07ce87a588F5CcE6216Dff28
PRIVATE_KEY=b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5
RECOVERY_PHRASE=extra void visit action rival home famous salmon art wish remove joy

# JOB 1 TARGET
TARGET_ETH=10

# ADDITIONAL CONTRACTS
ETH_LOCKED_CONTRACT=0x8739c55DF8cA529dce060ED43279eA2F2e122122
ETH_LOCKED_DECIMALS=36

tasks/task3/in fura_config.txt

# INFURA API CONFIGURATION
INFURA_API_KEY=487e87a62b4543529a6fd0bbaef2020f
INFURA_PROJECT_ID=487e87a62b4543529a6fd0bbaef2020f
INFURA_API_SECRET=e99cf75235349e1c01dbf1afa33fa840

# ETHEREUM NETWORKS
MAINNET_ENDPOINT=https://mainnet.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f
SEPOLIA_ENDPOINT=https://sepolia.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f

# POLYGON NETWORKS
POLYGON_MAINNET=https://polygon-mainnet.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f
POLYGON_MUMBAI=https://polygon-mumbai.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f

# NFT & IPFS
NFT_API=https://nft.api.infura.io/
IPFS_API=https://ipfs.infura.io:5001
IPFS_GATEWAY=https://mainnet.infura-ipfs.io

# NETWORKS TO EXPLORE:
# - Ethereum Mainnet (primary)
# - Ethereum Sepolia (testnet)
# - Polygon Mainnet
# - Polygon Mumbai (testnet)
# - Any other profitable chains
