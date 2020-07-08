// tslint:disable:no-console
// typescript
// upload files synchronously
import Client, {
    CommandResultMetaData, CommandStatus,
    UploadFilesCommand, SourceTargetFileNames,
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

    // create the command object
    const uc: UploadFilesCommand = new UploadFilesCommand(client, { files });

    // start the upload synchronously
    await uc.execute();

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = uc.getResultMetaData();

    if (uc.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
        console.log(uc.getBytesUploaded());
    } else {
        console.log(uploadResult.errors);
    }

})();