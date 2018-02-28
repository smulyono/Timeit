import vscode from 'vscode';

const STATUS = {
    STOP : "stop",
    PAUSE: "pause",
    RESUME : "resume",
    RUNNING: "running"
};

const DEFAULT_DURATION = 30;
const DEFAULT_EXTRA_TIME = 10;
const MINUTES_TO_MS = (60 * 1000);
const HOUR_TO_MS    = 60 * MINUTES_TO_MS;

class TimeIt {
    formatTimeDisplay(timeInMs) {
        // show in hh:mm:secs
        let hour = Math.floor(timeInMs / HOUR_TO_MS);
        
        const minutesLO = (timeInMs % HOUR_TO_MS);
        let minutes = Math.floor( minutesLO / MINUTES_TO_MS);

        const secondsLO = minutesLO % MINUTES_TO_MS;
        let seconds = Math.floor(secondsLO / 1000);

        return `${hour >= 10 ? hour : '0' + hour}:` + 
               `${minutes >= 10 ? minutes : '0' + minutes}:` + 
               `${seconds >= 10 ? seconds : '0' + seconds}s`;
    }

    loadConfiguration() {
        try {
            this.configuration = vscode.workspace.getConfiguration("timeit");
        } catch (e){}

        // counter for showing timer
        this.count = (this.configuration.duration || DEFAULT_DURATION) * (MINUTES_TO_MS);
        this.timeAddition = (this.configuration.extratime || DEFAULT_EXTRA_TIME) * (MINUTES_TO_MS);
        // task duration 
        this.taskDuration = this.count;
    }

    constructor() {
        console.log("TimeIt extensions are activated!");
        // DEFAULT value
        this.count = 0;
        this.startTime = this.endTime = undefined;
        this.timer= undefined;
        this.status = STATUS.STOP;
        this.taskName = "-";

        this.controlDisplayMore = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this.controlDisplayAlt = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
        this.controlDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
        this.controlDisplay.show();
        this.displayStatus();
    }

    async start() {
        // ask for task name
        this.taskName = await vscode.window.showInputBox({
            placeHolder : "Specify task name"
        });
        if (this.taskName) {
            this.status = STATUS.RUNNING;
            this.startTime = new Date();
    
            this.loadConfiguration();
            this.countdown();    
        }
    }

    get timeDisplay() {
        if (this.status !== STATUS.PAUSE) {
            // show what to display 
            this.endTime = new Date();
            let diff = this.endTime.getTime() - this.startTime.getTime();
            this.count -= diff;

            this.startTime = this.endTime;
        }
        return this.formatTimeDisplay(this.count);
    }

    get runningTimeDisplay() {
        let diff = this.taskDuration - this.count;
        return this.formatTimeDisplay(diff);
    }

    get timeAdditionDisplay() {
        return this.formatTimeDisplay(this.timeAddition);
    }

    displayStatus() {
        // control playback 
        switch (this.status) {
            case STATUS.STOP : 
                this.controlDisplayMore.hide();        
                this.controlDisplayAlt.hide();        
                this.controlDisplay.text = `$(triangle-right) Add Task`;
                this.controlDisplay.tooltip = "Creating new task and timer";
                this.controlDisplay.command = "extension.timeitStart";
            break;
            case STATUS.PAUSE :
                this.controlDisplayMore.hide();        
                this.controlDisplayAlt.hide();        
                this.controlDisplay.text = `$(triangle-right) $(watch) ${this.timeDisplay} (Paused)`;
                this.controlDisplay.tooltip = "Task is paused";
                this.controlDisplay.command = "extension.timeitResume";
            break;
            case STATUS.RESUME:
            default : 
                // Add more time into task
                this.controlDisplayMore.text = `$(diff-added) ${this.timeAdditionDisplay}`;
                this.controlDisplayMore.command = "extension.timeitExtra";
                this.controlDisplayMore.tooltip = "Add more time";
                this.controlDisplayMore.show();
                // Finish task
                this.controlDisplayAlt.text = `$(thumbsup)`;
                this.controlDisplayAlt.command = "extension.timeitStop";
                this.controlDisplayAlt.tooltip = "Finish task execution";
                this.controlDisplayAlt.show();
                // show the pause button
                this.controlDisplay.text = `$(watch) ${this.timeDisplay} (${this.taskName})`;
                this.controlDisplay.command = "extension.timeitPause";
                this.controlDisplay.tooltip = "Pause execution";
            break;
        }

    }

    updateDisplay() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.displayStatus();
    }

    countdown() {
        this.updateDisplay();
        if (this.count >= 0) {
            this.timer = setTimeout(this.countdown.bind(this), 1000);
        } else {
            this.stop();
        }
    }

    stop() {
        this.status = STATUS.STOP;
        this.updateDisplay();
        vscode.window.showInformationMessage(`Task ${this.taskName} finished with ${this.runningTimeDisplay}`);
    }

    pause() {
        this.status = STATUS.PAUSE;
        this.updateDisplay();
    }

    resume() {
        if (this.count > 0) {
            // reset the counter for calculating diff
            this.startTime = new Date();
            this.status = STATUS.RUNNING;
            this.countdown();
        }
    }

    addTime() {
        // add the duration (for countdown)
        this.count += this.timeAddition;
        // add the initial time duration (for completion)
        this.taskDuration += this.timeAddition;
    }
}

export default TimeIt;