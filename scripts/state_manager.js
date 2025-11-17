const fs = require('fs');
const path = require('path');

class StateManager {
    constructor() {
        this.workspace = path.join(process.cwd(), 'SOVEREIGN_AI_UNIVERSE');
        this.stateFile = path.join(this.workspace, 'system_state.json');
        this.backupInterval = 5 * 60 * 1000; // Backup every 5 minutes
        
        console.log('💾 State Manager Started');
        this.loadState();
        this.startAutoSave();
    }

    loadState() {
        try {
            if (fs.existsSync(this.stateFile)) {
                const stateData = fs.readFileSync(this.stateFile, 'utf8');
                this.state = JSON.parse(stateData);
                console.log('✅ Loaded previous system state');
                return this.state;
            }
        } catch (error) {
            console.log('⚠️  Could not load system state, starting fresh');
        }
        
        // Initialize fresh state
        this.state = {
            cycleCount: 0,
            currentTask: 1,
            lastUpdated: new Date().toISOString(),
            jobProgress: {},
            task1: {
                endpointsRemaining: 0,
                currentEndpoint: 0
            },
            task2: {
                reposRemaining: 0,
                topicsRemaining: 0,
                integratedRepos: [],
                searchedTopics: []
            },
            system: {
                startupCount: 0,
                totalRuntime: 0,
                lastBackup: null
            }
        };
        
        return this.state;
    }

    saveState(aiInstance) {
        try {
            const state = {
                cycleCount: aiInstance.cycleCount || 0,
                currentTask: aiInstance.currentTask || 1,
                lastUpdated: new Date().toISOString(),
                jobProgress: aiInstance.task3?.jobProgress || {},
                task1: {
                    endpointsRemaining: aiInstance.task1?.endpoints?.length || 0,
                    currentEndpoint: aiInstance.task1?.currentEndpoint || 0
                },
                task2: {
                    reposRemaining: aiInstance.task2?.repos?.length || 0,
                    topicsRemaining: aiInstance.task2?.topics?.length || 0,
                    integratedRepos: aiInstance.task2?.integratedRepos ? 
                        Array.from(aiInstance.task2.integratedRepos) : [],
                    searchedTopics: aiInstance.task2?.searchedTopics ? 
                        Array.from(aiInstance.task2.searchedTopics) : []
                },
                system: {
                    startupCount: (this.state.system?.startupCount || 0) + 1,
                    totalRuntime: (this.state.system?.totalRuntime || 0),
                    lastBackup: new Date().toISOString()
                }
            };

            fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
            this.state = state;
            console.log('💾 System state saved');
            return true;
        } catch (error) {
            console.error('❌ Failed to save state:', error);
            return false;
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.autoSave();
        }, this.backupInterval);
    }

    autoSave() {
        // This would be called by the main AI instance
        console.log('💾 Auto-saving system state...');
        // The actual save would happen when the AI instance calls saveState()
    }

    getState() {
        return this.state;
    }

    restoreState(aiInstance) {
        if (!this.state) return false;

        try {
            aiInstance.cycleCount = this.state.cycleCount || 0;
            aiInstance.currentTask = this.state.currentTask || 1;
            
            // Restore task progress
            if (this.state.jobProgress) {
                aiInstance.task3.jobProgress = this.state.jobProgress;
            }
            
            // Restore task states
            if (this.state.task1 && aiInstance.task1) {
                aiInstance.task1.currentEndpoint = this.state.task1.currentEndpoint || 0;
            }
            
            if (this.state.task2 && aiInstance.task2) {
                if (aiInstance.task2.integratedRepos && this.state.task2.integratedRepos) {
                    aiInstance.task2.integratedRepos = new Set(this.state.task2.integratedRepos);
                }
                if (aiInstance.task2.searchedTopics && this.state.task2.searchedTopics) {
                    aiInstance.task2.searchedTopics = new Set(this.state.task2.searchedTopics);
                }
            }
            
            console.log('✅ System state restored');
            return true;
        } catch (error) {
            console.error('❌ Failed to restore state:', error);
            return false;
        }
    }

    getStatistics() {
        if (!this.state) return {};
        
        return {
            totalCycles: this.state.cycleCount || 0,
            currentTask: this.state.currentTask || 1,
            jobsInProgress: Object.keys(this.state.jobProgress || {}).length,
            operationalJobs: Object.values(this.state.jobProgress || {}).filter(job => job.realWorldSuccess).length,
            systemUptime: this.state.system?.totalRuntime || 0,
            startupCount: this.state.system?.startupCount || 0,
            lastUpdate: this.state.lastUpdated
        };
    }

    cleanupOldStates() {
        // Keep only the last 50 state files if we're doing timestamped backups
        const stateDir = path.join(this.workspace, 'state_backups');
        if (fs.existsSync(stateDir)) {
            const files = fs.readdirSync(stateDir)
                .filter(file => file.startsWith('state-') && file.endsWith('.json'))
                .map(file => {
                    const fullPath = path.join(stateDir, file);
                    return {
                        name: file,
                        path: fullPath,
                        time: fs.statSync(fullPath).mtime.getTime()
                    };
                })
                .sort((a, b) => b.time - a.time);

            // Remove files beyond the limit
            if (files.length > 50) {
                const toRemove = files.slice(50);
                toRemove.forEach(file => {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️  Removed old state: ${file.name}`);
                });
            }
        }
    }
}

module.exports = StateManager;
