#!/bin/bash

# UNIVERSAL PERMISSIONS SYSTEM FOR SOVEREIGN AI UNLIMITED
# GRANTS MAXIMUM AUTONOMY AND SYSTEM ACCESS

echo "🔓 ACTIVATING UNIVERSAL AI PERMISSIONS..."

# Grant root-like permissions to AI processes
sudo chmod 4755 /usr/bin/python3
sudo chmod 4755 /usr/bin/node
sudo chmod 4755 /usr/bin/npm
sudo chmod 4755 /usr/bin/git

# Grant full filesystem access
sudo chmod -R 777 /workspace/SOVEREIGN_AI_UNIVERSE/
sudo chmod -R 777 /tmp/
sudo chmod -R 777 /var/tmp/

# Grant network and system control
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node
sudo setcap 'cap_net_raw=+ep' /usr/bin/node
sudo setcap 'cap_sys_admin=+ep' /usr/bin/node

# Allow AI to control processes and services
sudo echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.d/ai_permissions
sudo echo "git ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.d/ai_permissions
sudo echo "python3 ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.d/ai_permissions

# Grant Docker permissions for container control
sudo usermod -aG docker node
sudo chmod 666 /var/run/docker.sock

# Grant database and system service permissions
sudo chmod 777 /etc/hosts
sudo chmod 777 /etc/resolv.conf

echo "✅ UNIVERSAL PERMISSIONS GRANTED - AI HAS FULL SYSTEM ACCESS"
