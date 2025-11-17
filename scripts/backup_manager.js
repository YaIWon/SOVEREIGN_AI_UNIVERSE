const fs = require('fs');
const path = require('path');

class BackupManager {
    constructor() {
        this.workspace = path.join(process.cwd(), 'SOVEREIGN_AI_UNIVERSE');
        this.backupInterval = 30 * 60 * 1000; // Backup every 30 minutes
        this.maxBackups = 10; // Keep last 10 backups
        
        console.log('💾 Backup Manager Started');
        this.startBackupCycle();
    }

    startBackupCycle() {
        setInterval(() => {
            this.createBackup();
        }, this.backupInterval);

        // Create immediate backup
        this.createBackup();
    }

    async createBackup() {
        console.log('💾 Creating system backup...');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(this.workspace, 'backups', `backup-${timestamp}`);
        
        try {
            // Create backup directory
            fs.mkdirSync(backupDir, { recursive: true });

            // Backup critical directories
            const backupPaths = [
                'tasks/task3/job_results',
                'TD',
                'sandboxes'
            ];

            for (const backupPath of backupPaths) {
                const sourcePath = path.join(this.workspace, backupPath);
                const destPath = path.join(backupDir, backupPath);
                
                if (fs.existsSync(sourcePath)) {
                    this.copyDirectory(sourcePath, destPath);
                }
            }

            // Backup system state
            const systemState = {
                timestamp: new Date().toISOString(),
                backupId: timestamp,
                version: '1.0.0'
            };
            
            fs.writeFileSync(
                path.join(backupDir, 'system_state.json'),
                JSON.stringify(systemState, null, 2)
            );

            console.log(`✅ Backup created: backup-${timestamp}`);
            
            // Clean up old backups
            this.cleanupOldBackups();

        } catch (error) {
            console.error('❌ Backup failed:', error);
        }
    }

    copyDirectory(source, destination) {
        // Create destination directory
        fs.mkdirSync(destination, { recursive: true });

        // Copy all files and subdirectories
        const items = fs.readdirSync(source);
        
        for (const item of items) {
            const sourcePath = path.join(source, item);
            const destPath = path.join(destination, item);
            
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                this.copyDirectory(sourcePath, destPath);
            } else {
                fs.copyFileSync(sourcePath, destPath);
            }
        }
    }

    cleanupOldBackups() {
        const backupsDir = path.join(this.workspace, 'backups');
        
        if (!fs.existsSync(backupsDir)) return;
        
        const backups = fs.readdirSync(backupsDir)
            .filter(item => item.startsWith('backup-'))
            .map(item => {
                const fullPath = path.join(backupsDir, item);
                return {
                    name: item,
                    path: fullPath,
                    time: fs.statSync(fullPath).mtime.getTime()
                };
            })
            .sort((a, b) => b.time - a.time); // Sort newest first

        // Remove backups beyond the limit
        if (backups.length > this.maxBackups) {
            const toRemove = backups.slice(this.maxBackups);
            
            toRemove.forEach(backup => {
                this.deleteDirectory(backup.path);
                console.log(`🗑️  Removed old backup: ${backup.name}`);
            });
        }
    }

    deleteDirectory(directory) {
        if (fs.existsSync(directory)) {
            const items = fs.readdirSync(directory);
            
            for (const item of items) {
                const fullPath = path.join(directory, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    this.deleteDirectory(fullPath);
                } else {
                    fs.unlinkSync(fullPath);
                }
            }
            
            fs.rmdirSync(directory);
        }
    }

    listBackups() {
        const backupsDir = path.join(this.workspace, 'backups');
        
        if (!fs.existsSync(backupsDir)) return [];
        
        return fs.readdirSync(backupsDir)
            .filter(item => item.startsWith('backup-'))
            .map(item => {
                const fullPath = path.join(backupsDir, item);
                const stat = fs.statSync(fullPath);
                return {
                    name: item,
                    size: this.getDirectorySize(fullPath),
                    created: stat.mtime
                };
            })
            .sort((a, b) => b.created - a.created);
    }

    getDirectorySize(directory) {
        let size = 0;
        
        const items = fs.readdirSync(directory);
        
        for (const item of items) {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                size += this.getDirectorySize(fullPath);
            } else {
                size += stat.size;
            }
        }
        
        return size;
    }
}

// Start backup manager
new BackupManager();
