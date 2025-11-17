#!/bin/bash

echo "🔓 STARTING SOVEREIGN AI UNLIMITED - GOD MODE ACTIVATED..."
echo "🕒 Started at: $(date)"

# Activate universal permissions
echo "🔓 ACTIVATING UNIVERSAL PERMISSIONS..."
bash scripts/universal_permissions.sh

# Start Ganache with god mode
echo "🏦 STARTING GANACHE GOD MODE..."
node -e "
const GanacheGodMode = require('./scripts/ganache_godmode.js');
const godMode = new GanacheGodMode();
godMode.startGanache({
    port: 7545,
    chainId: 1337,
    gasLimit: 100000000,
    gasPrice: 0,
    accounts: 50,
    defaultBalanceEther: 1000000,
    blockTime: 1,
    hardfork: 'latest'
}).then(() => {
    console.log('✅ GANACHE GOD MODE READY');
});
"

# Wait for blockchain initialization
sleep 5

# Start all AI services with maximum permissions
echo "🧠 STARTING AI CORE WITH FULL AUTONOMY..."

cd /workspace/SOVEREIGN_AI_UNIVERSE

# Start core AI with environment variables for full access
export AI_PERMISSIONS="GOD_MODE"
export DEPLOYMENT_AUTHORITY="FULL"
export TRANSACTION_SIGNING="AUTONOMOUS"
export EXPERIMENTATION_MODE="UNLIMITED"

node SOVEREIGN_AI.js &

# Start all monitoring services with elevated privileges
sudo node scripts/monitor.js &
sudo node scripts/auto_deploy.js &
sudo node scripts/health_check.js &
sudo node scripts/backup_manager.js &

# Start experimental services
sudo node scripts/ganache_godmode.js &

echo ""
echo "✅ SOVEREIGN AI UNLIMITED - GOD MODE ACTIVE"
echo "============================================"
echo "🔓 PERMISSIONS: UNIVERSAL"
echo "🏦 BLOCKCHAIN: GANACHE GOD MODE"
echo "🧠 AI: FULL AUTONOMY"
echo "🌐 DEPLOYMENT: MAINNET READY"
echo "📡 TRANSACTIONS: AUTO-SIGNING"
echo "💸 TARGET: 0xc644d08B3ca775DD07ce87a588F5CcE6216Dff28"
echo ""

# Monitor and restart services indefinitely
while true; do
    sleep 30
    echo "🔄 GOD MODE SYSTEM HEARTBEAT: $(date)"
    
    # Restart any failed services
    if ! ps aux | grep "node SOVEREIGN_AI.js" | grep -v grep > /dev/null; then
        echo "🚨 AI CORE RESTARTING..."
        node SOVEREIGN_AI.js &
    fi
done

# First-time setup
if [ ! -f ".initialized" ]; then
    echo "🔄 First-time setup..."
    node deploy_sovereign_ai.js
    touch .initialized
    echo "✅ Initial setup completed"
fi

# Start core services
echo "🧠 Starting core AI system..."
node SOVEREIGN_AI.js &

echo "📈 Starting monitoring dashboard..."
node scripts/monitor.js &

echo "🔧 Starting auto-deploy service..."
node scripts/auto_deploy.js &

echo "🏥 Starting health monitor..."
node scripts/health_check.js &

echo "💾 Starting backup manager..."
node scripts/backup_manager.js &

# Display startup information
echo ""
echo "✅ SOVEREIGN AI UNLIMITED - SYSTEM ONLINE"
echo "=========================================="
echo "🌐 Dashboard: http://localhost:3000"
echo "🔗 Local Blockchain: http://localhost:8545"
echo "💻 Environment: GitHub Codespaces"
echo "🕒 Started: $(date)"
echo "📊 Services: AI Core, Monitor, Auto-Deploy, Health, Backup"
echo ""

# Monitor system health
while true; do
    sleep 60
    echo "🔄 System heartbeat: $(date)"
    
    # Check if main processes are still running
    if ! ps aux | grep "node SOVEREIGN_AI.js" | grep -v grep > /dev/null; then
        echo "🚨 AI Core process stopped - restarting..."
        node SOVEREIGN_AI.js &
    fi
done
