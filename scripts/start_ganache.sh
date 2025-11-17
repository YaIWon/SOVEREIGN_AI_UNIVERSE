#!/bin/bash

echo "🚀 Starting Ganache Local Blockchain..."

# Check if Ganache is already running
if lsof -Pi :7545 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Ganache is already running on port 7545"
    exit 0
fi

# Start Ganache with the GAC owner account pre-funded
ganache-cli \
    --port 7545 \
    --chainId 1337 \
    --gasLimit 10000000 \
    --gasPrice 20000000000 \
    --account="b9680689250ce51ef228ab76498a3d04ec11bfce30bff8274374dd747456bda5,1000000000000000000000" \
    --account="0x8739c55DF8cA529dce060ED43279eA2F2e122122,1000000000000000000000" \
    --secure \
    --unlock "0xc644d08B3ca775DD07ce87a588F5CcE6216Dff28" \
    --networkId 1337 \
    --db /workspace/SOVEREIGN_AI_UNIVERSE/ganache_chaindata &

echo "✅ Ganache started on http://localhost:7545"
echo "   📊 Accounts available with 1000 ETH each"
echo "   🔗 Chain ID: 1337"
echo "   ⛽ Gas Limit: 10,000,000"
