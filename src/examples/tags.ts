// typescript
import Client, { File, Folder, Share, Tag, FileSystemElement } from "../client";

(async () => {
    try {
        // create a new client using connectivity information from environment
        const client = new Client();
        // create a folder structure if not available
        const folder: Folder = await client.createFolder("folder/subfolder");
        // create file within the folder
        const file: File = await folder.createFile("myFile.txt", Buffer.from("My file content"));
        // create two tags
        const tag1: Tag = await client.createTag("tag 1");
        const tag2: Tag = await client.createTag("tag 2");
        // assign tag to folder
        folder.addTag(tag1.name);
        // assign tag to files
        file.addTag(tag1.name);
        file.addTag(tag2.name);

        // get list of file system elements with the tag1 assigned
        let fse: FileSystemElement[] = await client.getFileSystemElementByTags([tag1]);
        // print names of folder and file
        console.log(fse[0].name);
        console.log(fse[1].name);

        // get list of file system elements with the tag1 and tag2
        fse = await client.getFileSystemElementByTags([tag1, tag2]);
        // print name file
        console.log(fse[0].name);

        // delete the tags
        await tag1.delete();
        await tag2.delete();
        // delete the folder including the file and share
        await folder.delete();
    } catch (e) {
        // some error handling
        console.log(e);
    }
})();