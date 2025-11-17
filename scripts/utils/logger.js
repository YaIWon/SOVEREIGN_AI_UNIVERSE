const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.workspace = path.join(process.cwd(), 'SOVEREIGN_AI_UNIVERSE');
        this.logFile = path.join(this.workspace, 'sovereign_ai.log');
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        this.currentLevel = this.levels.INFO;
    }

    log(level, message, data = null) {
        if (this.levels[level] <= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                data
            };

            const logLine = `[${timestamp}] ${level}: ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
            
            // Console output
            console.log(logLine.trim());
            
            // File output
            fs.appendFileSync(this.logFile, logLine);
        }
    }

    error(message, data = null) {
        this.log('ERROR', message, data);
    }

    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    info(message, data = null) {
        this.log('INFO', message, data);
    }

    debug(message, data = null) {
        this.log('DEBUG', message, data);
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }

    getLogs(lines = 100) {
        if (!fs.existsSync(this.logFile)) {
            return [];
        }

        const logContent = fs.readFileSync(this.logFile, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.trim());
        return logLines.slice(-lines);
    }

    clear() {
        if (fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '');
        }
    }
}

module.exports = new Logger();
