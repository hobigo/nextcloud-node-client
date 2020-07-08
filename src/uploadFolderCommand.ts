// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("UploadFilesCommand");

import Client,
{
    File,
    FileSystemFolder,
    IFileNameFormats,
    UploadFilesCommand,
    UploadFilesCommandOptions,
    SourceTargetFileNames,
} from "./client";
import Command, { CommandStatus } from "./command";

/**
 * options to create a upload folder command
 */
export interface UploadFolderCommandOptions {
    /**
     * The name of the sourece folder with the file structure to be uploaded
     */
    folderName: string;
    /**
     * the funtion to determine the target file name having the sourece file name.
     * If the file should not be uploaded, return an empty string
     * @param {SourceTargetFileNames} fileNames
     */
    getTargetFileNameBeforeUpload?: (fileNames: SourceTargetFileNames) => string;
    processFileAfterUpload?: (file: File) => Promise<void>;
}

/**
 * Command to upload the contents of a folder from local file system to nextcloud recursivley
 */
export default class UploadFolderCommand extends Command {
    private folderName: string;
    private processFileAfterUpload?: (file: File) => Promise<void>;
    private getTargetFileNameBeforeUpload: (fileNames: SourceTargetFileNames) => string;
    private bytesUploaded: number;

    /**
     * @param {Client} client the client
     * @param {ISourceTargetFileNames[]} files the files to be uploaded
     * @param {(file: File) => void} processAfterUpload callback function to process the uploaded file
     */
    constructor(client: Client, options: UploadFolderCommandOptions) {
        super(client);
        this.folderName = options.folderName;
        this.processFileAfterUpload = options.processFileAfterUpload;
        if (options.getTargetFileNameBeforeUpload) {
            this.getTargetFileNameBeforeUpload = options.getTargetFileNameBeforeUpload;
        } else {
            this.getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => { return fileNames.targetFileName };
        }
        this.bytesUploaded = 0;
    }

    /**
     * execute the command
     * @async
     * @returns {Promise<void>}
     */
    protected async onExecute(): Promise<void> {
        this.status = CommandStatus.running;
        let fileNames: IFileNameFormats[] = [];
        const fsf: FileSystemFolder = new FileSystemFolder(this.folderName);
        try {
            fileNames = await fsf.getFileNames();
        } catch (e) {
            this.resultMetaData.errors.push(e);
            this.status = CommandStatus.failed;
            this.percentCompleted = 100;
            this.bytesUploaded = 0;
            this.resultMetaData.timeElapsed = 0;
            return;
        }

        const files: SourceTargetFileNames[] = [];
        for (const fileNameFormat of fileNames) {
            const targetFileName = this.getTargetFileNameBeforeUpload({ sourceFileName: fileNameFormat.absolute, targetFileName: fileNameFormat.relative });
            // add only files with a target name
            if (targetFileName !== "") {
                files.push({ sourceFileName: fileNameFormat.absolute, targetFileName });
            }
        }

        const options: UploadFilesCommandOptions = { files, processFileAfterUpload: this.processFileAfterUpload };
        const uc: UploadFilesCommand = new UploadFilesCommand(this.client, options);
        uc.execute();

        // check the processing status
        while (uc.isFinished() !== true) {
            this.status = uc.getStatus();
            this.percentCompleted = uc.getPercentCompleted();
            this.resultMetaData = uc.getResultMetaData();
            this.bytesUploaded = uc.getBytesUploaded();
            // wait one second
            await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
        }

        this.status = uc.getStatus();
        this.percentCompleted = uc.getPercentCompleted();
        this.resultMetaData = uc.getResultMetaData();
        this.bytesUploaded = uc.getBytesUploaded();
        return;
    };
    public getBytesUploaded(): number {
        return this.bytesUploaded;
    }

}
