const fs = require('fs');
const path = require('path');

class HealthMonitor {
    constructor() {
        this.workspace = path.join(process.cwd(), 'SOVEREIGN_AI_UNIVERSE');
        this.checkInterval = 60 * 1000; // Check every minute
        this.healthStatus = {
            system: 'healthy',
            lastCheck: new Date().toISOString(),
            services: {}
        };
        
        console.log('🏥 Health Monitor Started');
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, this.checkInterval);

        // Perform immediate check
        this.performHealthCheck();
    }

    async performHealthCheck() {
        console.log('🔍 Performing health check...');
        
        const checks = {
            fileSystem: this.checkFileSystem(),
            taskProgress: this.checkTaskProgress(),
            systemResources: this.checkSystemResources(),
            deploymentStatus: this.checkDeploymentStatus()
        };

        try {
            const results = await Promise.allSettled(Object.values(checks));
            
            this.healthStatus = {
                system: 'healthy',
                lastCheck: new Date().toISOString(),
                services: {
                    fileSystem: results[0].status === 'fulfilled' ? results[0].value : 'failed',
                    taskProgress: results[1].status === 'fulfilled' ? results[1].value : 'failed',
                    systemResources: results[2].status === 'fulfilled' ? results[2].value : 'failed',
                    deploymentStatus: results[3].status === 'fulfilled' ? results[3].value : 'failed'
                }
            };

            // Check if any critical service is failing
            const criticalServices = ['fileSystem', 'taskProgress'];
            const failingServices = criticalServices.filter(service => 
                this.healthStatus.services[service] === 'failed'
            );

            if (failingServices.length > 0) {
                this.healthStatus.system = 'degraded';
                console.log(`⚠️  System health degraded: ${failingServices.join(', ')}`);
            } else {
                console.log('✅ System health: OK');
            }

            this.saveHealthStatus();

        } catch (error) {
            console.error('❌ Health check failed:', error);
            this.healthStatus.system = 'failed';
        }
    }

    checkFileSystem() {
        return new Promise((resolve) => {
            const criticalPaths = [
                'TD/core_mindset.txt',
                'tasks/task3/jobs_list.txt',
                'SOVEREIGN_AI.js'
            ];

            const missingFiles = criticalPaths.filter(path => 
                !fs.existsSync(`${this.workspace}/${path}`)
            );

            resolve(missingFiles.length === 0 ? 'healthy' : 'degraded');
        });
    }

    checkTaskProgress() {
        return new Promise((resolve) => {
            const progressPath = path.join(this.workspace, 'tasks/task3/job_results');
            
            if (!fs.existsSync(progressPath)) {
                resolve('healthy'); // No progress files yet is normal at start
                return;
            }

            const files = fs.readdirSync(progressPath);
            const stuckJobs = files.filter(file => {
                if (file.endsWith('_progress.txt')) {
                    const content = fs.readFileSync(path.join(progressPath, file), 'utf8');
                    return content.includes('Status: stuck');
                }
                return false;
            });

            resolve(stuckJobs.length > 2 ? 'degraded' : 'healthy');
        });
    }

    checkSystemResources() {
        return new Promise((resolve) => {
            const used = process.memoryUsage();
            const memoryUsage = used.heapUsed / used.heapTotal;
            
            resolve(memoryUsage > 0.8 ? 'degraded' : 'healthy');
        });
    }

    checkDeploymentStatus() {
        return new Promise((resolve) => {
            // Check if auto-deploy is functioning
            const deployLogPath = path.join(this.workspace, 'deployment.log');
            if (fs.existsSync(deployLogPath)) {
                const stats = fs.statSync(deployLogPath);
                const hoursSinceLastDeploy = (Date.now() - stats.mtime) / (1000 * 60 * 60);
                resolve(hoursSinceLastDeploy > 24 ? 'degraded' : 'healthy');
            } else {
                resolve('healthy'); // No deployments yet is normal
            }
        });
    }

    saveHealthStatus() {
        const healthFile = path.join(this.workspace, 'health_status.json');
        fs.writeFileSync(healthFile, JSON.stringify(this.healthStatus, null, 2));
    }

    getHealthStatus() {
        return this.healthStatus;
    }
}

// Start health monitor
new HealthMonitor();
