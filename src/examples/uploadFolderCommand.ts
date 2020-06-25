// tslint:disable:no-console
// typescript
// upload folder structure asynchronously
import Client, {
    File,
    CommandResult,
    CommandStatus,
    UploadFolderCommand,
    SourceTargetFileNames,
} from "../client";

(async () => {
    const client = new Client();

    // define a source folder
    const folderName: string = "c:\\Users\\holger\\Documents\\GitHub\\nextcloud-node-client\\src\\test\\data\\Borstenson\\Company";

    // define a callback to process the uploaded file optionally
    const processFileAfterUpload = async (file: File): Promise<void> => {
        // set a tag and a comment
        await file.addTag("Company");
        await file.addComment(`Hello ${file.baseName} your mime type is ${file.mime}`);
        // do even more fancy stuff ...
        return;
    };

    // define a callback to determine the target file name
    // or to filter out files
    const getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => {
        // do not copy *.tmp files
        if (fileNames.sourceFileName.endsWith(".tmp")) {
            return "";
        }
        return `/Company Information${fileNames.targetFileName}`;
    };

    // create the command object
    const uc: UploadFolderCommand = new UploadFolderCommand(
        client, { folderName, getTargetFileNameBeforeUpload, processFileAfterUpload }
    );

    // start the upload asynchronously (will not throw exceptions!)
    uc.execute();

    // check the processing status as long as the comman is running
    while (uc.isFinished() !== true) {
        // wait one second
        await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();
        console.log(uc.getPercentCompleted() + "%");
    }

    // use the result to do the needful
    const uploadResult: CommandResult = uc.getResult();

    if (uploadResult.status === CommandStatus.success) {
        console.log(uploadResult.messages);
    } else {
        console.log(uploadResult.errors);
    }

})();