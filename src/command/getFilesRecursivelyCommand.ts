// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("GetFilesRecursivelyCommand");

import Client, { File, Folder, FolderGetFilesOptions } from "../client";
import Command, { CommandStatus } from "./command";

export interface GetFilesRecursivelyCommandOptions {
    /**
     * the source nextcloud folder to start listing the files
     */
    sourceFolder: Folder;
    /**
     * function to filter files
     */
    filterFile?: (file: File) => File | null;
}

/**
 * Command to get all files of a nextcloud folder recursively
 */
export default class GetFilesRecursivelyCommand extends Command {
    private sourceFolder: Folder;
    private filterFile?: (file: File) => File | null;
    private files: File[];

    /**
     * @param {Client} client the client
     * @param {SourceTargetFileNames[]} files the files to be uploaded
     * @param {(file: File) => void} processAfterUpload callback function to process the uploaded file
     */
    constructor(client: Client, options: GetFilesRecursivelyCommandOptions) {
        super(client);
        this.sourceFolder = options.sourceFolder;
        this.filterFile = options.filterFile;
        this.files = [];
    }

    /**
     * execute the command
     * @async
     * @returns {Promise<void>}
     */
    protected async onExecute(): Promise<void> {
        this.status = CommandStatus.running;
        const startTime = new Date();
        try {
            this.percentCompleted = 0;
            await this.processFolder(this.sourceFolder, 100);
            // console.log("file count", this.files.length);
            this.resultMetaData.messages.push(`${this.files.length} files found`);
        } catch (e) {
            debug(e.message);
            this.resultMetaData.errors.push(e.message);
        }

        this.percentCompleted = 100;
        if (this.resultMetaData.errors.length > 0) {
            this.status = CommandStatus.failed;
        } else {
            this.status = CommandStatus.success;
        }
        this.resultMetaData.timeElapsed = new Date().getTime() - startTime.getTime();
        return;
    };


    public getFiles(): File[] {
        return this.files;
    }

    /**
     * adds files of folder and processes subordinated folders
     * @param {Folder} folder the folder to process
     * @param {number} percentagethe percentage that is finished, when the function returns
     */
    private async processFolder(folder: Folder, percentage: number): Promise<void> {
        // tslint:disable-next-line:no-console
        // console.log(folder.name);

        const options: FolderGetFilesOptions = { filterFile: this.filterFile }
        const folderFiles: File[] = await folder.getFiles(options);
        for (const fi of folderFiles) {
            this.files.push(fi);
        }

        const subFolders: Folder[] = await folder.getSubFolders();
        if (subFolders.length === 0) {
            this.percentCompleted += percentage;
        }
        for (const subFolder of subFolders) {
            // console.log("folder", subFolder.name);
            await this.processFolder(subFolder, percentage / subFolders.length);
        }
        return;
    }
}
