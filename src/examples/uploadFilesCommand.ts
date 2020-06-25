// tslint:disable:no-console
// typescript
// upload files asynchronously
import Client, {
    File,
    CommandResult,
    CommandStatus,
    UploadFilesCommand,
    SourceTargetFileNames,
} from "../client";

(async () => {
    const client = new Client();

    // create a list of files to upload
    const files: SourceTargetFileNames[] = [
        {
            sourceFileName: "c:\\Users\\holger\\Documents\\GitHub\\nextcloud-node-client\\src\\test\\data\\Borstenson\\Company\\Borstenson Company Profile.pdf",
            targetFileName: "/Company Information/Borstenson Company Profile.pdf"
        },
        // add even more files ...
    ];
    // define a callback to process the uploaded file optionally
    const processFileAfterUpload = async (file: File): Promise<void> => {
        // set a tag and a comment
        await file.addTag("Company");
        await file.addComment(`Hello ${file.baseName} your mime type is ${file.mime}`);
        // do even more fancy stuff ...
        return;
    };

    // create the command object
    const uc: UploadFilesCommand =
        new UploadFilesCommand(client, { files, processFileAfterUpload });

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