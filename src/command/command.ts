// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("Command");

import Client, {
    CommandAlreadyExecutedError,
} from "../client";

/**
 * The potential states that a command can have.
 * When a command is created, the state is "initial"
 * When the execution has started, the status is "running"
 * When the execution has finsihed, the status can be "succes" or "failed"
 */
export enum CommandStatus {
    /**
     * When a command is created, the state is "initial"
     */
    initial = "initial",
    /**
     * When the execution has started, the status is "running"
     */
    running = "running",
    /**
     * After successful  execution of the command, the status is "success"
     */
    success = "success",
    /**
     * After unsuccessfull execution of the command, the status is "failed"
     */
    failed = "failed",
}

/**
 * when the command has finished, the client can get the result of the command execution
 */
export interface CommandResultMetaData {
    errors: string[],
    messages: string[],
    timeElapsed: number,
}

/**
 * The command class represents a potential long running activity.
 * This activity has been wrapped into an object to ease the tracking of the processing state.
 * Create a command with  receiver information, execute the command and check the status and progress.
 * Check the result when finsished.
 */
export default abstract class Command {
    protected client: Client;
    protected status: CommandStatus;
    protected percentCompleted: number;
    protected resultMetaData: CommandResultMetaData;

    constructor(client: Client) {
        this.client = client;
        this.status = CommandStatus.initial;
        this.percentCompleted = 0;
        this.resultMetaData = { messages: [], errors: [], timeElapsed: 0 };
    }

    /**
     * final execute the command
     * @async
     * @final
     * @returns {Promise<void>}
     */
    public async execute(): Promise<void> {
        debug("execute Command = " + this.constructor.name, this.status);
        if (this.isFinished()) {
            throw new CommandAlreadyExecutedError("Error: Command has already been executed. Command = " + this.constructor.name);
        }
        if (this.status === CommandStatus.initial) {
            const startTime = new Date();
            await this.onExecute();
            this.resultMetaData.timeElapsed = new Date().getTime() - startTime.getTime();
        }
        // do nothing if already running
    }

    /**
     * execute the command
     * @async
     * @returns {Promise<void>}
     */
    protected abstract onExecute(): Promise<void>;

    /**
     * returns true, if the command has been finished
     * @returns {boolean}
     */
    public isFinished(): boolean {
        if (this.status === CommandStatus.failed || this.status === CommandStatus.success) {
            return true;
        }
        return false;
    }

    /**
     * returns the status of the command
     * @returns {CommandStatus}
     */
    public getStatus(): CommandStatus {
        return this.status;
    }

    /**
     * returns the completion percentage of the command
     * @returns {number} percentage of completion
     */
    public getPercentCompleted(): number {
        return this.percentCompleted;
    }

    /**
     * returns the result meta data of the command
     * @returns {null|any} the result of the command
     */
    public getResultMetaData(): CommandResultMetaData {
        return this.resultMetaData;
    }

}
