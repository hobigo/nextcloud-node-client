// typescript
import Client, { File, Folder, Tag, } from "nextcloud-node-client";

(async () => {
    try {
        // create a new client using connectivity information from environment 
        const client = new Client();
        // create a folder structure
        const folder: Folder = await client.createFolder("folder/subfolder");
        // create file within the folder
        const file: File = await folder.createFile("myFile.txt", Buffer.from("My file content"));
        // add a tag to the file and create the tag if not existing
        await file.addTag("MyTag");
        // add a comment to the file
        await file.addComment("myComment");
        // get the file content
        const content: Buffer = await file.getContent();
        // delete the folder including the file
        //await folder.delete();
    } catch (e) {
        // some error handling   
        console.log(e);
    }
})();

console.log("sssx");