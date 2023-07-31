const logger = {
    level: 'info',
    levels: {
        'debug': 20,
        'info': 50,
        'warn': 80,
        'error': 100
    },
    dolog: function (args) {
        let flog = {};
        for (let a in args) {
            try {
                flog[a] = JSON.stringify(args[a]);
            } catch (e) {
                flog[a] = "Error processing field";
                console.log(e);
            }
        }
        if (!flog['timestamp']) {
            flog['timestamp'] = Date();
        }
        console.log(flog);
    },
    canILog: function (llevel) {
        return this.levels[this.level] <= this.levels[llevel];
    },
    debug: function () {
        if (this.canILog('debug')) { this.dolog(arguments); }
    },
    info: function () {
        if (this.canILog('info')) { this.dolog(arguments); }
    },
    warn: function () {
        if (this.canILog('warn')) { this.dolog(arguments); }
    },
    error: function () {
        if (this.canILog('error')) { this.dolog(arguments); }
    },
};

module.exports = logger;
