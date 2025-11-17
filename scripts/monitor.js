const express = require('express');
const fs = require('fs');
const path = require('path');

class MonitoringDashboard {
    constructor() {
        this.app = express();
        this.port = 3000;
        this.workspace = path.join(process.cwd(), 'SOVEREIGN_AI_UNIVERSE');
        
        this.setupRoutes();
        this.startServer();
    }

    setupRoutes() {
        this.app.use(express.static('public'));
        
        this.app.get('/', (req, res) => {
            res.send(this.getDashboardHTML());
        });

        this.app.get('/api/status', (req, res) => {
            res.json(this.getSystemStatus());
        });

        this.app.get('/api/jobs', (req, res) => {
            res.json(this.getJobsStatus());
        });

        this.app.get('/api/deployments', (req, res) => {
            res.json(this.getDeploymentStatus());
        });
    }

    getSystemStatus() {
        return {
            status: 'running',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
            environment: 'GitHub Codespaces'
        };
    }

    getJobsStatus() {
        const jobs = [];
        const resultsPath = path.join(this.workspace, 'tasks/task3/job_results');
        
        if (fs.existsSync(resultsPath)) {
            const files = fs.readdirSync(resultsPath);
            
            files.forEach(file => {
                if (file.endsWith('_progress.txt')) {
                    const content = fs.readFileSync(path.join(resultsPath, file), 'utf8');
                    const jobNumber = parseInt(file.replace('job', '').replace('_progress.txt', ''));
                    
                    const status = this.extractValue(content, 'Status:');
                    const cycles = this.extractValue(content, 'Total Cycles:');
                    const sandboxSuccess = content.includes('sandboxSuccess: true');
                    const realWorldSuccess = content.includes('realWorldSuccess: true');
                    
                    jobs.push({
                        number: jobNumber,
                        status,
                        cycles: parseInt(cycles) || 0,
                        sandboxSuccess,
                        realWorldSuccess,
                        lastUpdated: new Date().toISOString()
                    });
                }
            });
        }
        
        return jobs.sort((a, b) => a.number - b.number);
    }

    getDeploymentStatus() {
        const jobs = this.getJobsStatus();
        const operational = jobs.filter(j => j.realWorldSuccess).length;
        const inProgress = jobs.filter(j => j.sandboxSuccess && !j.realWorldSuccess).length;
        const developing = jobs.filter(j => !j.sandboxSuccess && !j.realWorldSuccess).length;
        
        return {
            operational,
            inProgress,
            developing,
            total: jobs.length,
            successRate: jobs.length > 0 ? (operational / jobs.length * 100).toFixed(2) : 0
        };
    }

    extractValue(content, key) {
        const match = content.match(new RegExp(`${key}\\s*(.+)`));
        return match ? match[1].trim() : 'unknown';
    }

    getDashboardHTML() {
        const status = this.getSystemStatus();
        const deployments = this.getDeploymentStatus();
        const jobs = this.getJobsStatus();
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Sovereign AI Unlimited - Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #0f0f23; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #1a1a2e; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .job-card { background: #1a1a2e; padding: 15px; border-radius: 8px; border-left: 4px solid #007acc; }
        .job-operational { border-left-color: #00cc66; }
        .job-ready { border-left-color: #ffcc00; }
        .job-developing { border-left-color: #007acc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Sovereign AI Unlimited</h1>
            <p>24/7 Autonomous Deployment - GitHub Codespaces</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div>Operational Jobs</div>
                <div class="stat-value">${deployments.operational}</div>
            </div>
            <div class="stat-card">
                <div>Ready for Deployment</div>
                <div class="stat-value">${deployments.inProgress}</div>
            </div>
            <div class="stat-card">
                <div>In Development</div>
                <div class="stat-value">${deployments.developing}</div>
            </div>
            <div class="stat-card">
                <div>Success Rate</div>
                <div class="stat-value">${deployments.successRate}%</div>
            </div>
        </div>
        
        <h2>Job Status</h2>
        <div class="jobs-grid">
            ${jobs.map(job => `
                <div class="job-card ${job.realWorldSuccess ? 'job-operational' : job.sandboxSuccess ? 'job-ready' : 'job-developing'}">
                    <h3>Job ${job.number}</h3>
                    <p>Status: ${job.status}</p>
                    <p>Cycles: ${job.cycles}</p>
                    <p>Sandbox: ${job.sandboxSuccess ? '✅' : '⏳'}</p>
                    <p>Real World: ${job.realWorldSuccess ? '✅' : '⏳'}</p>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>System running in GitHub Codespaces | Uptime: ${Math.floor(status.uptime / 60)} minutes</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
        `;
    }

    startServer() {
        this.app.listen(this.port, () => {
            console.log(`📊 Monitoring dashboard running on http://localhost:${this.port}`);
        });
    }
}

// Start monitoring dashboard
new MonitoringDashboard();
