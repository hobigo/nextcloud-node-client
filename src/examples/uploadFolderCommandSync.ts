// tslint:disable:no-console
// typescript
// upload folder structure synchronously
import Client, {
    CommandResultMetaData, CommandStatus, UploadFolderCommand,
} from "../client";

(async () => {
    const client = new Client();

    // define a source folder
    const folderName: string = "c:\\Users\\holger\\Documents\\GitHub\\nextcloud-node-client\\src\\test\\data\\Borstenson\\Company";

    // create the command object
    const uc: UploadFolderCommand = new UploadFolderCommand(client, { folderName }
    );

    // start the upload synchronously
    await uc.execute();

    // use the result to do the needful
    const uploadResult: CommandResultMetaData = uc.getResultMetaData();

    if (uc.getStatus() === CommandStatus.success) {
        console.log(uploadResult.messages);
    } else {
        console.log(uploadResult.errors);
    }

})();