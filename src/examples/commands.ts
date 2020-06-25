// typescript
import Client, {
    File,
    FileSystemFolder,
    IFileNameFormats,
    UploadFilesCommand,
    ISourceTargetFileNames,
    UploadFilesCommandOptions,
    UploadFolderCommandOptions,
} from "../client";

(async () => {
    try {
        // create a new client using connectivity information from environment
        const client = new Client();

        const folderName: string = "c:/Users/holger/cloud/hobigo.de/s7sync/ebay";
        const fsf: FileSystemFolder = new FileSystemFolder(folderName);
        const fileNames: IFileNameFormats[] = await fsf.getFileNames();

        const files: ISourceTargetFileNames[] = [];
        for (const fileNameFormat of fileNames) {
            files.push({ sourceFileName: fileNameFormat.absolute, targetFileName: `/test/UploadFilesCommand/ebay${fileNameFormat.relative}` });
        }
        const processFileAfterUpload = async (file: File): Promise<void> => {
            try {
                await file.addTag("Upload");
                await file.addComment(`Cool Stuff ${file.baseName} Type is ${file.mime}`);
            } catch (e) {
                // nop
            }
            return;
        };
        const options: UploadFilesCommandOptions = { files, processFileAfterUpload };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        uc.execute();

        // check the processing status
        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            console.log(uc.getPercentCompleted() + "%");
            // wait one second
            await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
        }
        // tslint:disable-next-line:no-console
        console.log("result", uc.getResult());

    } catch (e) {
        // some error handling
        console.log(e);
    }
})();