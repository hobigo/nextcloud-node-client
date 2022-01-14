import { ShareType } from "../share";
import Client, { File, Folder, Share, SharePermission } from "./../client";

(async () => {
  try {
    // create a new client using connectivity information from environment
    const client = new Client();
    // create a folder structure if not available
    const folder: Folder = await client.createFolder("folder/subfolder");
    // create file within the folder
    const file: File = await folder.createFile(
      "myFile.txt",
      Buffer.from("My file content")
    );
    // add a tag to the file and create the tag if not existing
    await file.addTag("MyTag");
    // add a comment to the file
    await file.addComment("myComment");
    // get the file content
    const content: Buffer = await file.getContent();
    // share the file publicly with password and note
    const share: Share = await client.createShare({
      fileSystemElement: file,
      permissions: SharePermission.all,
      shareType: ShareType.publicLink
    });
    await share.setPassword("some password");
    await share.setNote("some note\nnew line");
    // use the url to access the share
    const shareLink: string | null = share.url;
    // delete the folder including the file and share
    await folder.delete();
  } catch (e) {
    // some error handling
    console.log(e);
  }
})();
