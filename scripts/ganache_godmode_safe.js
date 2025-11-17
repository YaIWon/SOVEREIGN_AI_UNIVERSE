const { exec, spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const GasRelaySystem = require('./gas_relay_system');

class SafeGanacheGodMode {
    constructor() {
        this.ganacheProcess = null;
        this.gasRelay = new GasRelaySystem();
        this.workspace = path.join(process.cwd(), 'SOVEREIGN_AI_UNIVERSE');
    }

    // SAFE MAINNET DEPLOYMENT - NO PERSONAL GAS COSTS
    async deployToMainnetSafely(contractData, options = {}) {
        logger.info('Attempting gasless mainnet deployment...');

        // Try gasless methods in order of preference
        const methods = [
            () => this.gasRelay.deployViaMetaTransaction(contractData),
            () => this.gasRelay.deployViaSponsor(contractData),
            () => this.gasRelay.deployViaCreate2(contractData),
            () => this.gasRelay.useGasSponsor(null, contractData),
            () => this.gasRelay.deployViaFlashbots(contractData)
        ];

        for (let i = 0; i < methods.length; i++) {
            try {
                const result = await methods[i]();
                if (result.success) {
                    logger.info(`Gasless deployment successful via method ${i + 1}`, result);
                    return result;
                }
            } catch (error) {
                logger.debug(`Gasless method ${i + 1} failed`, { error: error.message });
            }
        }

        // LAST RESORT: Only use personal wallet if ALL gasless methods fail
        logger.warn('All gasless methods failed, using personal wallet as last resort');
        return await this.deployWithPersonalWallet(contractData, options);
    }

    // PERSONAL WALLET DEPLOYMENT (LAST RESORT)
    async deployWithPersonalWallet(contractData, options = {}) {
        // ADD SAFETY CHECKS HERE
        const confirmed = await this.confirmPersonalWalletUsage();
        if (!confirmed) {
            throw new Error('User declined personal wallet usage');
        }

        const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f');
        const wallet = new ethers.Wallet('b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5', provider);

        logger.warn('USING PERSONAL WALLET FOR GAS', {
            from: wallet.address,
            balance: await provider.getBalance(wallet.address)
        });

        const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, wallet);
        const contract = await factory.deploy(...(contractData.args || []), options);
        const receipt = await contract.deploymentTransaction().wait();

        return {
            success: true,
            contractAddress: contract.target,
            transactionHash: receipt.hash,
            gasPaidBy: 'PERSONAL_WALLET',
            warning: 'Real ETH was spent on gas'
        };
    }

    // SAFETY CONFIRMATION
    async confirmPersonalWalletUsage() {
        // In a real app, this would show a confirmation dialog
        // For CLI, we can use readline or just return false for safety
        logger.error('PERSONAL WALLET USAGE REQUIRED - REAL ETH WILL BE SPENT');
        logger.error('This should only happen if all gasless methods fail');
        
        // For safety, default to false
        return false;
        
        // In production, you might do:
        // const readline = require('readline').createInterface(...);
        // return new Promise(resolve => {
        //     readline.question('Spend real ETH on gas? (yes/no): ', answer => {
        //         resolve(answer.toLowerCase() === 'yes');
        //     });
        // });
    }

    // SAFE TRANSACTION SIGNING
    async signTransactionSafely(transaction) {
        // Always try gasless first
        try {
            const gaslessResult = await this.gasRelay.deployViaMetaTransaction({
                bytecode: transaction.data,
                abi: [],
                args: []
            });

            if (gaslessResult.success) {
                return gaslessResult;
            }
        } catch (error) {
            logger.debug('Gasless transaction failed', { error: error.message });
        }

        // If gasless fails, require confirmation for personal wallet
        const confirmed = await this.confirmPersonalWalletUsage();
        if (!confirmed) {
            throw new Error('Transaction cancelled - gasless methods failed and user declined personal wallet usage');
        }

        // Proceed with personal wallet as last resort
        return await this.signWithPersonalWallet(transaction);
    }

    async signWithPersonalWallet(transaction) {
        const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/487e87a62b4543529a6fd0bbaef2020f');
        const wallet = new ethers.Wallet('b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5', provider);

        const tx = await wallet.sendTransaction(transaction);
        const receipt = await tx.wait();

        return {
            success: true,
            receipt,
            gasPaidBy: 'PERSONAL_WALLET',
            warning: 'Real ETH was spent'
        };
    }
}

module.exports = SafeGanacheGodMode;
