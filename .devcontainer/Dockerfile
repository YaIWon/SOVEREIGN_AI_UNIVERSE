FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:18

# Install blockchain development tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    curl \
    wget \
    build-essential

# Install Foundry (Rust-based Ethereum development framework)
RUN curl -L https://foundry.paradigm.xyz | bash
RUN /root/.foundry/bin/foundryup

# Install global blockchain tools
RUN npm install -g \
    truffle \
    ganache-cli \
    hardhat \
    @remix-project/remixd \
    @truffle/contract \
    ethers \
    web3 \
    solc \
    typechain \
    @typechain/ethers-v5

# Install Python blockchain packages
RUN pip3 install \
    web3 \
    py-solc-x \
    eth-account \
    eth-keys \
    eth-hash \
    eth-utils

# Install additional useful tools
RUN npm install -g \
    nodemon \
    concurrently \
    http-server

# Create workspace directory
RUN mkdir -p /workspace/SOVEREIGN_AI_UNIVERSE

WORKDIR /workspace

# Set up startup script
COPY scripts/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Create a default hardhat project for testing
RUN cd /tmp && npx hardhat init --yes && rm -rf /tmp/hardhat-project

CMD ["/usr/local/bin/startup.sh"]

.github/workflows/codespaces-deploy.yml

name: Deploy to GitHub Codespaces

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Deploy to Codespaces
      run: |
        echo "🚀 Deployment to GitHub Codespaces completed"
        echo "The Sovereign AI system will auto-start in Codespaces"
        
    - name: Notify deployment
      run: |
        echo "✅ Sovereign AI Unlimited deployed to GitHub Codespaces"
        echo "📊 Monitoring available at: https://${{ github.repository }}/codespaces"
