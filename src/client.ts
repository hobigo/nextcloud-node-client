// this must be the first
import { config } from "dotenv";
config();

import debugFactory from "debug";
import parser from "fast-xml-parser";
import {
    Headers,
    RequestInit,
    Response,
} from "node-fetch";
import path, { basename } from "path";
import Environment from "./environment";
import EnvironmentVcapServices from "./environmentVcapServices";
import ClientError, {
    QueryLimitError,
    QueryOffsetError,
    InsufficientPrivilegesError,
    InvalidServiceResponseFormatError,
    OperationFailedError,
    UserGroupAlreadyExistsError,
    UserGroupDeletionFailedError,
    UserResendWelcomeEmailError,
    UserGroupDoesNotExistError,
    UserNotFoundError,
    UserAlreadyExistsError,
    UserCreateError,
    UserUpdateError,
} from "./error";
import FakeServer from "./fakeServer";
import File from "./file";
import FileSystemElement from "./fileSystemElement";
import Folder from "./folder";
import { HttpClient, IHttpClientOptions, IProxy, IRequestContext } from "./httpClient";
import RequestResponseLog from "./requestResponseLog";
import RequestResponseLogEntry from "./requestResponseLogEntry";
import Server, { IServerOptions } from "./server";
import Share, { ICreateShare, SharePermission } from "./share";
import Tag from "./tag";
import UserGroup from "./userGroup";
import User, { IUserOptions, IUserOptionsQuota, IUserQuotaUserFriendly, UserProperty } from "./user";

export {
    InvalidServiceResponseFormatError,
    InsufficientPrivilegesError,
    OperationFailedError,
    QueryLimitError,
    QueryOffsetError,
    UserNotFoundError,
    UserAlreadyExistsError,
    UserCreateError,
    UserResendWelcomeEmailError,
    UserUpdateError,
    UserGroupAlreadyExistsError,
    UserGroupDeletionFailedError,
    UserGroupDoesNotExistError,
}

export {
    Client,
    ClientError,
    Environment,
    Folder,
    File,
    FileSystemElement,
    ICreateShare,
    IServerOptions,
    Tag,
    FakeServer,
    Server,
    Share,
    SharePermission,
    RequestResponseLog,
    RequestResponseLogEntry,
    User,
    UserGroup,
    UserProperty,
    IUserOptionsQuota,
    IUserQuotaUserFriendly,
};

const debug = debugFactory("NCClient");
// const debug = console.log;

interface IStat {
    "type": string;
    "filename": string;
    "basename": string;
    "lastmod": string;
    "size"?: number;
    "mime"?: string;
    "fileid"?: number;
}

export interface IUpsertUserOptions {
    "id": string;
    "enabled"?: boolean;
    "subadminGroups"?: string[],
    "memberGroups"?: string[],
    "quota"?: string,
    "email"?: string,
    "displayName"?: string,
    "password"?: string,
    "phone"?: string,
    "address"?: string,
    "website"?: string,
    "twitter"?: string,
    "language"?: string
    "locale"?: string,
    "superAdmin"?: boolean,
    "resendWelcomeEmail"?: boolean,
}

export interface IUserPropertyChange {
    "property": string;
    "previousValue": string;
    "newValue": string;
    "error"?: string;
}

export interface IUpsertUserReport {
    "id": string;
    "message": string;
    "changes": IUserPropertyChange[];
}

export interface ISysInfoNextcloudClient {
    "version": string;
}

export interface ISysInfoNextcloud {
    "system": object;
    "storage": object;
    "shares": object;
}

export interface ISysBasicData {
    "serverTimeString": string;
    "uptimeString": string;
    "timeServersString": string;
}

export interface ISystemInfo {
    "nextcloud": ISysInfoNextcloud;
    // @todo change object to something strongly typed
    "server": object;
    // @todo change object to something strongly typed
    "activeUsers": object;
    "nextcloudClient": ISysInfoNextcloudClient;
}

export interface IQuota {
    used: number;
    available: number | string;
}

/**
 * The nextcloud client is the root object to access the remote api of the nextcloud server.<br>
 */
export default class Client {

    public static webDavUrlPath: string = "/remote.php/webdav";

    private nextcloudOrigin: string;
    private nextcloudAuthHeader: string;
    private nextcloudRequestToken: string;
    private webDAVUrl: string;
    private proxy?: IProxy;
    private fakeServer?: FakeServer;
    private logRequestResponse: boolean = false;
    private httpClient?: HttpClient;

    /**
     * Creates a new instance of a nextcloud client.<br/>
     * Use the server to provide server connectivity information to the client.<br/>
     * (The FakeServer is only used for testing and code coverage)<br/><br/>
     * If the server is not provided the client tries to find the connectivity information
     * in the environment.<br/>
     * If a <b>VCAP_SERVICES</b> environment variable is available, the client tries to find
     * a service with the name <b>"nextcloud"</b> in the user-provides-services section.<br/>
     * If no VCAP_SERVICES are available, the client uses the following variables
     * from the envirnonment for the connectivity:<br/>
     * <ul>
     * <li>NEXTCLOUD_URL - the WebDAV url of the nextcloud server</li>
     * <li>NEXTCLOUD_USERNAME - the user name</li>
     * <li>NEXTCLOUD_PASSWORD - the application password</li>
     * </ul>
     * @param server optional server information to connection to a nextcloud server
     * @constructor
     */
    public constructor(server?: Server | FakeServer) {
        debug("constructor");
        this.nextcloudOrigin = "";
        this.nextcloudAuthHeader = "";
        this.nextcloudRequestToken = "";
        this.webDAVUrl = "";

        // if no server is provided, try to get a server from VCAP_S environment "nextcloud" instance
        // If no VCAP_S environment exists try from environment
        if (!server) {
            try {
                const env: EnvironmentVcapServices = new EnvironmentVcapServices("nextcloud");
                server = env.getServer();
            } catch (e) {
                const env: Environment = new Environment();
                server = env.getServer();
            }
        }

        if (server instanceof Server) {

            this.proxy = server.proxy;

            debug("constructor: webdav url %s", server.url);

            if (server.url.indexOf(Client.webDavUrlPath) === -1) {
                // not a valid nextcloud url
                throw new ClientError(`The provided nextcloud url "${server.url}" does not comply to the nextcloud url standard, "${Client.webDavUrlPath}" is missing`,
                    "ERR_INVALID_NEXTCLOUD_WEBDAV_URL");
            }
            this.nextcloudOrigin = server.url.substr(0, server.url.indexOf(Client.webDavUrlPath));

            debug("constructor: nextcloud url %s", this.nextcloudOrigin);

            this.nextcloudAuthHeader = "Basic " + Buffer.from(server.basicAuth.username + ":" + server.basicAuth.password).toString("base64");
            this.nextcloudRequestToken = "";
            if (server.url.slice(-1) === "/") {
                this.webDAVUrl = server.url.slice(0, -1);
            } else {
                this.webDAVUrl = server.url;
            }

            this.logRequestResponse = server.logRequestResponse;

            const options: IHttpClientOptions = {
                authorizationHeader: this.nextcloudAuthHeader,
                logRequestResponse: this.logRequestResponse,
                origin: this.nextcloudOrigin,
                proxy: this.proxy,
            };

            this.httpClient = new HttpClient(options);
        }

        if (server instanceof FakeServer) {
            this.fakeServer = server;
            this.webDAVUrl = "https://fake.server" + Client.webDavUrlPath;
        }
    }

    /**
     * returns the used and free quota of the nextcloud account
     */
    public async getQuota(): Promise<IQuota> {
        debug("getQuota");
        const requestInit: RequestInit = {
            method: "PROPFIND",
        };

        const response: Response = await this.getHttpResponse(
            this.webDAVUrl + "/",
            requestInit,
            [207],
            { description: "Client get quota" });

        const properties: any[] = await this.getPropertiesFromWebDAVMultistatusResponse(response, Client.webDavUrlPath + "/");

        let quota: IQuota | null = null;
        for (const prop of properties) {
            if (prop["quota-available-bytes"]) {
                quota = {
                    available: "unlimited",
                    used: prop["quota-used-bytes"],
                };
                if (prop["quota-available-bytes"] > 0) {
                    quota.available = prop["quota-available-bytes"];
                }
            }
        }

        if (!quota) {
            debug("Error, quota not available: %s ", JSON.stringify(properties, null, 4));
            throw new ClientError(`Error, quota not available`, "ERR_QUOTA_NOT_AVAILABLE");
        }
        debug("getQuota = %O", quota);
        return quota;
    }

    // ***************************************************************************************
    // tags
    // ***************************************************************************************

    /**
     * creates a new tag, if not already existing
     * this function will fail with http 403 if the user does not have admin privileges
     * @param tagName the name of the tag
     * @returns tagId
     */
    public async createTag(tagName: string): Promise<Tag> {

        debug("createTag");
        let tag: Tag | null;
        // is the tag already existing?
        tag = await this.getTagByName(tagName);
        if (tag) {
            return tag;
        }
        // tag does not exist, create tag

        const requestInit: RequestInit = {
            body: `{ "name": "${tagName}", "userVisible": true, "userAssignable": true, "canAssign": true }`,
            headers: new Headers({ "Content-Type": "application/json" }),
            method: "POST",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + "/remote.php/dav/systemtags/",
            requestInit,
            [201],
            { description: "Tag create" },
        );
        const tagString: string | null = response.headers.get("Content-Location");
        debug("createTag new tagId %s, tagName %s", tagString, tagName);
        if (tagString === "" || tagString === null) {
            throw new ClientError(`Error, tag with name '${tagName}' could not be created`, "ERR_TAG_CREATE_FAILED");
        }

        // the number id of the tag is the last element in the id (path)
        const tagId: number = this.getTagIdFromHref(tagString);

        tag = new Tag(this, tagId, tagName, true, true, true);
        return tag;
    }

    /**
     * returns a tag identified by the name or null if not found
     * @param tagName the name of the tag
     * @returns tag or null
     */
    public async getTagByName(tagName: string): Promise<Tag | null> {

        debug("getTag");

        const tags: Tag[] = await this.getTags();
        for (const tag of tags) {
            if (tag.name === tagName) {
                return tag;
            }
        }
        return null;
    }

    /**
     * returns a tag identified by the id or null if not found
     * @param tagId the id of the tag
     * @returns tag or null
     */
    public async getTagById(tagId: number): Promise<Tag | null> {

        debug("getTagById");

        const tags: Tag[] = await this.getTags();
        for (const tag of tags) {
            if (tag.id === tagId) {
                return tag;
            }
        }
        return null;
    }

    /**
     * deletes the tag by id
     * this function will fail with http 403 if the user does not have admin privileges
     * @param tagId the id of the tag like "/remote.php/dav/systemtags/234"
     */
    public async deleteTag(tagId: number): Promise<void> {

        debug("deleteTag tagId: $s", tagId);

        const requestInit: RequestInit = {
            method: "DELETE",
        };

        const response: Response = await this.getHttpResponse(
            `${this.nextcloudOrigin}/remote.php/dav/systemtags/${tagId}`,
            requestInit,
            [204, 404],
            { description: "Tag delete" });
    }

    /**
     * deletes all visible assignable tags
     * @throws Error
     */
    public async deleteAllTags(): Promise<void> {

        debug("deleteAllTags");

        const tags: Tag[] = await this.getTags();

        for (const tag of tags) {
            // debug("deleteAllTags tag: %O", tag);
            await tag.delete();
        }
    }

    /**
     * returns a list of tags
     * @returns array of tags
     */
    public async getTags(): Promise<Tag[]> {
        debug("getTags PROPFIND %s", this.nextcloudOrigin + "/remote.php/dav/systemtags/");
        const requestInit: RequestInit = {
            body: `<?xml version="1.0"?>
            <d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
              <d:prop>
                <oc:id />
                <oc:display-name />
                <oc:user-visible />
                <oc:user-assignable />
                <oc:can-assign />
              </d:prop>
            </d:propfind>`,
            method: "PROPFIND",
        };

        const relUrl = `/remote.php/dav/systemtags/`;

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + relUrl,
            requestInit,
            [207],
            { description: "Tags get" });

        const properties: any[] = await this.getPropertiesFromWebDAVMultistatusResponse(response, relUrl + "/*");
        const tags: Tag[] = [];

        for (const prop of properties) {
            tags.push(new Tag(this,
                this.getTagIdFromHref(prop._href),
                prop["display-name"],
                prop["user-visible"],
                prop["user-assignable"],
                prop["can-assign"]));
        }

        return tags;
    }

    /**
     * returns the list of tag names and the tag ids
     * @param fileId the id of the file
     */
    public async getTagsOfFile(fileId: number): Promise<Map<string, number>> {
        debug("getTagsOfFile");

        const requestInit: RequestInit = {
            body: `<?xml version="1.0"?>
            <d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
              <d:prop>
                <oc:id />
                <oc:display-name />
                <oc:user-visible />
                <oc:user-assignable />
                <oc:can-assign />
              </d:prop>
            </d:propfind>`,
            method: "PROPFIND",
        };

        const relUrl = `/remote.php/dav/systemtags-relations/files/${fileId}`;
        const response: Response = await this.getHttpResponse(
            `${this.nextcloudOrigin}${relUrl}`,
            requestInit,
            [207],
            { description: "File get tags" });

        const properties: any[] = await this.getPropertiesFromWebDAVMultistatusResponse(response, relUrl + "/*");
        const tagMap: Map<string, number> = new Map();

        for (const prop of properties) {
            tagMap.set(prop["display-name"], prop.id);
        }

        debug("tags of file %O", tagMap);
        return tagMap;
    }

    /**
     * removes the tag from the file
     * @param fileId the file id
     * @param tagId the tag id
     */
    public async removeTagOfFile(fileId: number, tagId: number): Promise<void> {
        debug("removeTagOfFile tagId: $s fileId:", tagId, fileId);

        const requestInit: RequestInit = {
            method: "DELETE",
        };

        const response: Response = await this.getHttpResponse(
            `${this.nextcloudOrigin}/remote.php/dav/systemtags-relations/files/${fileId}/${tagId}`,
            requestInit,
            [204, 404],
            { description: "File remove tag" });
        return;
    }

    /**
     * returns the id of the file or -1 of not found
     * @returns id of the file or -1 if not found
     */
    public async getFileId(fileUrl: string): Promise<number> {
        debug("getFileId");

        const requestInit: RequestInit = {
            body: `
            <d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
              <d:prop>
                  <oc:fileid />
              </d:prop>
            </d:propfind>`,
            method: "PROPFIND",
        };

        const response: Response = await this.getHttpResponse(
            fileUrl,
            requestInit,
            [207],
            { description: "File get id" });

        const properties: any[] = await this.getPropertiesFromWebDAVMultistatusResponse(response, "");

        for (const prop of properties) {
            if (prop.fileid) {
                return prop.fileid;
            }
        }

        debug("getFileId no file id found for %s", fileUrl);
        return -1;
    }

    public async getFolderContents(folderName: string): Promise<any[]> {
        debug("getFolderContents");

        const requestInit: RequestInit = {
            body: `<?xml version="1.0"?>
            <d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns" xmlns:ocs="http://open-collaboration-services.org/ns">
              <d:prop>
                <d:getlastmodified />
                <d:getetag />
                <d:getcontenttype />
                <d:resourcetype />
                <oc:fileid />
                <oc:permissions />
                <oc:size />
                <d:getcontentlength />
                <nc:has-preview />
                <nc:mount-type />
                <nc:is-encrypted />
                <ocs:share-permissions />
                <oc:tags />
                <oc:favorite />
                <oc:comments-unread />
                <oc:owner-id />
                <oc:owner-display-name />
                <oc:share-types />
              </d:prop>
            </d:propfind>`,
            method: "PROPFIND",
        };
        const url = `${this.webDAVUrl}${folderName}`;
        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [207],
            { description: "Folder get contents" });

        const properties: any[] = await this.getPropertiesFromWebDAVMultistatusResponse(response, "");

        const folderContents: any[] = [];
        // tslint:disable-next-line:no-empty
        for (const prop of properties) {
            let fileName = decodeURI(prop._href.substr(prop._href.indexOf(Client.webDavUrlPath) + 18));
            if (fileName.endsWith("/")) {
                fileName = fileName.slice(0, -1);
            }
            if ((url + "/").endsWith(prop._href)) {
                continue;
            }
            const folderContentsEntry: any = {};
            folderContentsEntry.lastmod = prop.getlastmodified;
            folderContentsEntry.fileid = prop.fileid;
            folderContentsEntry.basename = fileName.split("/").reverse()[0];
            folderContentsEntry.filename = fileName;
            if (prop.getcontenttype) {
                folderContentsEntry.mime = prop.getcontenttype;
                folderContentsEntry.size = prop.getcontentlength;
                folderContentsEntry.type = "file";
            } else {
                folderContentsEntry.type = "directory";
            }
            if (folderContentsEntry.basename !== "") {
                folderContents.push(folderContentsEntry);
            }

        }

        // debug("folderContentsEntry $s", JSON.stringify(folderContents, null, 4));
        return folderContents;
    }

    /**
     * creates a folder and all parent folders in the path if they do not exist
     * @param folderName name of the folder /folder/subfolder/subfolder
     * @returns a folder object
     */
    public async createFolder(folderName: string): Promise<Folder> {
        folderName = this.sanitizeFolderName(folderName);
        debug("createFolder: folderName=%s", folderName);

        const parts1: string[] = folderName.split("/");
        for (const p of parts1) {
            if ((p) === "." || p === "..") {
                throw new ClientError(`Error creating folder, folder name "${folderName}" invalid`, "ERR_CREATE_FOLDER_INVALID_FOLDER_NAME");
            }
        }

        let folder: Folder | null;

        folder = await this.getFolder(folderName);
        if (folder) {
            debug("createFolder: folder already available %O", folder.name);
            return folder;
        } else {
            // try to do a simple create with the complete path
            try {
                debug("createFolder: folder = %s", folderName);
                await this.createFolderInternal(folderName);
            } catch (e) {
                // create all folders in the path
                const parts: string[] = folderName.split("/");
                parts.shift();
                let folderPath: string = "";
                debug("createFolder: parts = %O", parts);

                for (const part of parts) {

                    debug("createFolder: part = %O", part);
                    folderPath += "/" + part;
                    folder = await this.getFolder(folderPath);

                    if (folder === null) {
                        debug("createFolder: folder not available");
                        // folder not  available

                        debug("createFolder: folder = %s", folderPath);
                        await this.createFolderInternal(folderPath);
                    } else {
                        debug("createFolder: folder already available %s", folderPath);
                    }
                }
            }
        }

        folder = await this.getFolder(folderName);
        if (folder) {
            debug("createFolder: new folder %O", folder.name);
            return folder;
        } else {
            throw new ClientError(`Error creating folder, folder name "${folderName}"
            `, "ERR_CREATE_FOLDER_FAILED");
        }

    }

    /**
     * deletes a file
     * @param fileName name of folder "/f1/f2/f3/x.txt"
     */
    public async deleteFile(fileName: string): Promise<void> {

        const url: string = this.webDAVUrl + fileName;
        debug("deleteFile %s", url);

        const requestInit: RequestInit = {
            method: "DELETE",
        };
        try {
            await this.getHttpResponse(
                url,
                requestInit,
                [204],
                { description: "File delete" },
            );

        } catch (err) {
            debug("Error in deleteFile %s %s %s", err.message, requestInit.method, url);
            throw err;
        }
    }

    /**
     * deletes a folder
     * @param folderName name of folder "/f1/f2/f3"
     */
    public async deleteFolder(folderName: string): Promise<void> {
        folderName = this.sanitizeFolderName(folderName);
        debug("deleteFolder:");

        const folder: Folder | null = await this.getFolder(folderName);

        if (folder) {
            await this.deleteFile(folderName);
        }
    }

    /**
     * get the root folder object
     * @returns {Promise<Folder>} the root folder
     */
    public getRootFolder(): Folder {
        return new Folder(this, "/", "", "");
    }

    /**
     * get a folder object from a path string
     * @param {string} folderName Name of the folder like "/company/branches/germany"
     * @returns {Promise<Folder | null>} null if the folder does not exist or an folder object
     */
    public async getFolder(folderName: string): Promise<Folder | null> {
        folderName = this.sanitizeFolderName(folderName);
        debug("getFolder %s", folderName);

        // return root folder
        if (folderName === "/" || folderName === "") {
            return this.getRootFolder();
        }

        try {
            const stat: IStat = await this.stat(folderName);
            debug(": SUCCESS!!");
            if (stat.type !== "file") {
                return new Folder(this,
                    stat.filename.replace(/\\/g, "/"),
                    stat.basename,
                    stat.lastmod,
                    stat.fileid);
            } else {
                debug("getFolder: found object is file not a folder");
                return null;
            }
        } catch (e) {
            debug("getFolder: exception occurred calling stat %O", e.message);
            return null;
        }
    }

    /**
     * get a array of folders from a folder path string
     * @param folderName Name of the folder like "/company/branches/germany"
     * @returns array of folder objects
     */
    public async getSubFolders(folderName: string): Promise<Folder[]> {
        debug("getSubFolders: folder %s", folderName);
        const folders: Folder[] = [];
        folderName = this.sanitizeFolderName(folderName);

        const folderElements: any[] = await this.Contents(folderName, true);

        for (const folderElement of folderElements) {
            debug("getSubFolders: adding subfolders %s", folderElement.filename);
            folders.push(new Folder(this,
                folderElement.filename.replace(/\\/g, "/"),
                folderElement.basename,
                folderElement.lastmod,
                folderElement.fileid));
        }

        return folders;
    }

    /**
     * get files of a folder
     * @param folderName Name of the folder like "/company/branches/germany"
     * @returns array of file objects
     */
    public async getFiles(folderName: string): Promise<File[]> {
        debug("getFiles: folder %s", folderName);
        const files: File[] = [];
        folderName = this.sanitizeFolderName(folderName);

        const fileElements: any[] = await this.Contents(folderName, false);

        for (const folderElement of fileElements) {
            debug("getFiles: adding file %s", folderElement.filename);
            // debug("getFiles: adding file %O", folderElement);
            files.push(new File(this,
                folderElement.filename.replace(/\\/g, "/"),
                folderElement.basename,
                folderElement.lastmod,
                folderElement.size,
                folderElement.mime,
                folderElement.fileid));
        }

        return files;
    }

    /**
     * create a new file of overwrites an existing file
     * @param fileName the file name /folder1/folder2/filename.txt
     * @param data the buffer object
     */
    public async createFile(fileName: string, data: Buffer | NodeJS.ReadableStream): Promise<File> {

        if (fileName.startsWith("./")) {
            fileName = fileName.replace("./", "/");
        }

        const baseName: string = path.basename(fileName);
        const folderName: string = path.dirname(fileName);

        debug("createFile folder name %s base name %s", folderName, baseName);

        // ensure that we have a folder
        await this.createFolder(folderName);
        await this.putFileContents(fileName, data);

        let file: File | null;
        file = await this.getFile(fileName);

        if (!file) {
            throw new ClientError(`Error creating file, file name "${fileName}"`, "ERR_CREATE_FILE_FAILED");
        }
        return file;
    }

    /**
     * returns a nextcloud file object
     * @param fileName the full file name /folder1/folder2/file.pdf
     */
    public async getFile(fileName: string): Promise<File | null> {
        debug("getFile fileName = %s", fileName);

        try {
            const stat: IStat = await this.stat(fileName);
            debug(": SUCCESS!!");
            if (stat.type === "file") {
                return new File(this,
                    stat.filename.replace(/\\/g, "/"),
                    stat.basename,
                    stat.lastmod,
                    stat.size!,
                    stat.mime || "",
                    stat.fileid || -1);
            } else {
                debug("getFile: found object is a folder not a file");
                return null;
            }
        } catch (e) {
            debug("getFile: exception occurred calling stat %O", e.message);
            return null;
        }
    }

    /**
     * renames the file or moves it to an other location
     * @param sourceFileName source file name
     * @param targetFileName target file name
     */
    public async moveFile(sourceFileName: string, targetFileName: string): Promise<File> {

        const url: string = this.webDAVUrl + sourceFileName;
        const destinationUrl: string = this.webDAVUrl + targetFileName;

        debug("moveFile from '%s' to '%s'", url, destinationUrl);

        const requestInit: RequestInit = {
            headers: new Headers({ Destination: destinationUrl }),
            method: "MOVE",
        };
        try {
            await this.getHttpResponse(
                url,
                requestInit,
                [201],
                { description: "File move" },
            );

        } catch (err) {
            debug("Error in move file %s %s source: %s destination: %s", err.message, requestInit.method, url, destinationUrl);
            throw new ClientError("Error: moving file failed: source=" + sourceFileName + " target=" + targetFileName + " - " + err.message, "ERR_FILE_MOVE_FAILED");
        }

        const targetFile: File | null = await this.getFile(targetFileName);
        if (!targetFile) {
            throw new ClientError("Error: moving file failed: source=" + sourceFileName + " target=" + targetFileName, "ERR_FILE_MOVE_FAILED");
        }

        return targetFile;
    }

    /**
     * renames the folder or moves it to an other location
     * @param sourceFolderName source folder name
     * @param tarName target folder name
     */
    public async moveFolder(sourceFolderName: string, tarName: string): Promise<Folder> {

        const url: string = this.webDAVUrl + sourceFolderName;
        const destinationUrl: string = this.webDAVUrl + tarName;

        debug("moveFolder from '%s' to '%s'", url, destinationUrl);

        const requestInit: RequestInit = {
            headers: new Headers({ Destination: destinationUrl }),
            method: "MOVE",
        };
        try {
            await this.getHttpResponse(
                url,
                requestInit,
                [201],
                { description: "Folder move" },
            );

        } catch (err) {
            debug("Error in move folder %s %s source: %s destination: %s", err.message, requestInit.method, url, destinationUrl);
            throw new ClientError("Error: moving folder failed: source=" + sourceFolderName + " target=" + tarName + " - " + err.message, "ERR_FOLDER_MOVE_FAILED");
        }

        const tar: Folder | null = await this.getFolder(tarName);
        if (!tar) {
            throw new ClientError("Error: moving folder failed: source=" + sourceFolderName + " target=" + tarName, "ERR_FOLDER_MOVE_FAILED");
        }

        return tar;
    }

    /**
     * returns the content of a file
     * @param fileName name of the file /d1/file1.txt
     * @returns Buffer with file content
     */
    public async getContent(fileName: string): Promise<Buffer> {
        const url = this.webDAVUrl + fileName;
        debug("getContent GET %s", url);
        const requestInit: RequestInit = {
            method: "GET",
        };
        let response: Response;
        try {
            response = await this.getHttpResponse(
                url,
                requestInit,
                [200],
                { description: "File get content" });
        } catch (err) {
            debug("Error getContent %s - error %s", url, err.message);
            throw err;
        }

        return Buffer.from(await response.buffer());
    }

    /**
     * returns the content of a file
     * @param fileName name of the file /d1/file1.txt
     * @returns Buffer with file content
     */
    public async pipeContentStream(fileName: string, destination: NodeJS.WritableStream): Promise<void> {
        const url = this.webDAVUrl + fileName;
        debug("getContent GET %s", url);
        const requestInit: RequestInit = {
            method: "GET",
        };
        let response: Response;
        try {
            response = await this.getHttpResponse(
                url,
                requestInit,
                [200],
                { description: "File pipe content stream" });
        } catch (err) {
            debug("Error getContent %s - error %s", url, err.message);
            throw err;
        }
        response.body.pipe(destination);
    }

    /**
     * returns the link to a file for downloading
     * @param fileName name of the file /folder1/folder1.txt
     * @returns url
     */
    public getLink(fileName: string): string {
        debug("getLink of %s", fileName);
        return this.webDAVUrl + fileName;
    }

    /**
     * returns the url to the file in the nextcloud UI
     * @param fileId the id of the file
     */
    public getUILink(fileId: number): string {
        debug("getUILink of %s", fileId);
        return `${this.nextcloudOrigin}/apps/files/?fileid=${fileId}`;
    }

    /**
     * adds a tag to a file or folder
     * if the tag does not exist, it is automatically created
     * if the tag is created, the user must have damin privileges
     * @param fileId the id of the file
     * @param tagName the name of the tag
     * @returns nothing
     * @throws Error
     */
    public async addTagToFile(fileId: number, tagName: string): Promise<void> {
        debug("addTagToFile file:%s tag:%s", fileId, tagName);
        const tag: Tag = await this.createTag(tagName);

        if (!tag.canAssign) {
            throw new ClientError(`Error: No permission to assign tag "${tagName}" to file. Tag is not assignable`, "ERR_TAG_NOT_ASSIGNABLE");
        }

        const addTagBody: any = {
            canAssign: tag.canAssign,
            id: tag.id,
            name: tag.name,
            userAssignable: tag.assignable,
            userVisible: tag.visible,
        };

        const requestInit: RequestInit = {
            body: JSON.stringify(addTagBody, null, 4),
            headers: new Headers({ "Content-Type": "application/json" }),
            method: "PUT",
        };

        await this.getHttpResponse(
            `${this.nextcloudOrigin}/remote.php/dav/systemtags-relations/files/${fileId}/${tag.id}`,
            requestInit,
            [201, 409],
            { description: "File add tag" }); // created or conflict
    }

    // ***************************************************************************************
    // activity
    // ***************************************************************************************
    /*
    @todo to be refactored to eventing

    public async getActivities(): Promise<string[]> {
        const result: string[] = [];
        const requestInit: RequestInit = {
            headers: new Headers({ "ocs-apirequest": "true" }),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + "/ocs/v2.php/apps/activity/api/v2/activity/files?format=json&previews=false&since=97533",
            requestInit,
            [200],
            { description: "Activities get" });

        const responseObject: any = await response.json();
        // @todo

        for (const res of responseObject.ocs.data) {
            debug(JSON.stringify({
                acivityId: res.activity_id,
                objects: res.objects,
                type: res.type,
            }, null, 4));
        }

        // debug("getActivities: responseObject %s", JSON.stringify(responseObject, null, 4));

        return result;
    }
*/
    // ***************************************************************************************
    // comments
    // ***************************************************************************************

    /**
     * adds a comment to a file
     * @param fileId the id of the file
     * @param comment the comment to be added to the file
     */
    public async addCommentToFile(fileId: number, comment: string): Promise<void> {
        debug("addCommentToFile file:%s comment:%s", fileId, comment);

        const addCommentBody: any = {
            actorType: "users",
            message: comment,
            objectType: "files",
            verb: "comment",
        };

        const requestInit: RequestInit = {
            body: JSON.stringify(addCommentBody, null, 4),
            headers: new Headers({ "Content-Type": "application/json" }),
            method: "POST",
        };

        await this.getHttpResponse(
            `${this.nextcloudOrigin}/remote.php/dav/comments/files/${fileId}`,
            requestInit,
            [201],
            { description: "File add comment" }); // created
    }

    /**
     * returns comments of a file / folder
     * @param fileId the id of the file / folder
     * @param top number of comments to return
     * @param skip the offset
     * @returns array of comment strings
     * @throws Exception
     */
    public async getFileComments(fileId: number, top?: number, skip?: number): Promise<string[]> {
        debug("getFileComments fileId:%s", fileId);
        if (!top) {
            top = 30;
        }

        if (!skip) {
            skip = 0;
        }

        const requestInit: RequestInit = {
            body: `<?xml version="1.0" encoding="utf-8" ?>
                    <oc:filter-comments xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
                        <oc:limit>${top}</oc:limit>
                        <oc:offset>${skip}</oc:offset>
                    </oc:filter-comments>`,
            method: "REPORT",
        };

        const response: Response = await this.getHttpResponse(
            `${this.nextcloudOrigin}/remote.php/dav/comments/files/${fileId}`,
            requestInit,
            [207],
            { description: "File get comments" });

        const properties: any[] = await this.getPropertiesFromWebDAVMultistatusResponse(response, "");
        const comments: string[] = [];
        for (const prop of properties) {
            comments.push(prop.message);
        }

        return comments;
    }

    /**
     * returns system information about the nextcloud server and the nextcloud client
     */
    public async getSystemInfo(): Promise<ISystemInfo> {
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + "/ocs/v2.php/apps/serverinfo/api/v1/info",
            requestInit,
            [200],
            { description: "SystemInfo get" });

        const rawResult: any = await response.json();
        // validate the raw result
        let system = {};
        let storage = {};
        let shares = {};
        let server = {};
        let activeUsers = {};

        if (rawResult && rawResult.ocs && rawResult.ocs.data) {
            if (rawResult.ocs.data.nextcloud) {
                if (rawResult.ocs.data.nextcloud.system) {
                    system = rawResult.ocs.data.nextcloud.system;
                } else {
                    throw new ClientError("Fatal Error: nextcloud data.nextcloud.system missing", "ERR_SYSTEM_INFO_MISSING_DATA");
                }

                if (rawResult.ocs.data.nextcloud.storage) {
                    storage = rawResult.ocs.data.nextcloud.storage;
                } else {
                    throw new ClientError("Fatal Error: nextcloud data.nextcloud.storage missing", "ERR_SYSTEM_INFO_MISSING_DATA");
                }

                if (rawResult.ocs.data.nextcloud.shares) {
                    shares = rawResult.ocs.data.nextcloud.shares;
                } else {
                    throw new ClientError("Fatal Error: nextcloud data.nextcloud.shares missing", "ERR_SYSTEM_INFO_MISSING_DATA");
                }
            } else {
                throw new ClientError("Fatal Error: nextcloud data.nextcloud missing", "ERR_SYSTEM_INFO_MISSING_DATA");
            }

            if (rawResult.ocs.data.server) {
                server = rawResult.ocs.data.server;
            } else {
                throw new ClientError("Fatal Error: nextcloud data.server missing", "ERR_SYSTEM_INFO_MISSING_DATA");
            }

            if (rawResult.ocs.data.activeUsers) {
                activeUsers = rawResult.ocs.data.activeUsers;
            } else {
                throw new ClientError("Fatal Error: nextcloud data.activeUsers missing", "ERR_SYSTEM_INFO_MISSING_DATA");
            }

        } else {
            throw new ClientError("Fatal Error: nextcloud system data missing", "ERR_SYSTEM_INFO_MISSING_DATA");
        }

        const result: ISystemInfo = {
            activeUsers,
            nextcloud:
            {
                shares,
                storage,
                system,
            },
            nextcloudClient:
            {
                version: require("../package.json").version,
            },
            server,
        };
        return result;
    }

    public async getSystemBasicData(): Promise<ISysBasicData> {
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + "/ocs/v2.php/apps/serverinfo/api/v1/basicdata",
            requestInit,
            [200],
            { description: "System Basic Data get" });

        const rawResult: any = await response.json();
        // console.log("Basic Data\n", JSON.stringify(rawResult));
        let result: ISysBasicData;

        if (rawResult &&
            rawResult.ocs &&
            rawResult.ocs.data &&
            rawResult.ocs.data.servertime &&
            rawResult.ocs.data.uptime &&
            rawResult.ocs.data.timeservers) {
            result = {
                serverTimeString: rawResult.ocs.data.servertime.replace("\n", ""),
                uptimeString: rawResult.ocs.data.uptime.replace("\n", ""),
                timeServersString: rawResult.ocs.data.timeservers.trim(),
            }
        } else {
            throw new ClientError("Fatal Error: nextcloud basic data missing", "ERR_SYSTEM_INFO_MISSING_DATA");
        }

        return result;
    }

    // ***************************************************************************************
    // user management
    // ***************************************************************************************

    // ***************************************************************************************
    // user group
    // spec: https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/instruction_set_for_groups.html
    // ***************************************************************************************

    /**
     * returns a list of user groups
     * @param search string
     * @param limit number
     * @param offset number
     * @returns list of user groups
     * @throws QueryLimitError
     * @throws QueryOffsetError
     */
    public async getUserGroups(search?: string, limit?: number, offset?: number): Promise<UserGroup[]> {
        debug("getUserGroups");

        const userGroupIds: string[] = await this.getUserGroupIds(search, limit, offset);
        const userGroups: UserGroup[] = [];
        for (const userGroupId of userGroupIds) {
            userGroups.push(new UserGroup(this, userGroupId));
        }
        return userGroups;
    }

    /**
     * returns a list of user groups
     * @param search string
     * @param limit number
     * @param offset number
     * @returns list of user groups
     * @throws QueryLimitError
     * @throws QueryOffsetError
     */
    public async getUserGroupIds(search?: string, limit?: number, offset?: number): Promise<string[]> {
        debug("getUserGroupIds");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        let url = this.getOcsUrl(`/groups`);
        const queryParameter: string[] = [];
        if (search) {
            queryParameter.push(`search=${search}`);
        }
        if (limit) {
            if (limit < 1) {
                throw new QueryLimitError("The limit must be larger than 0");
            }
            queryParameter.push(`limit=${limit}`);
        }
        if (offset) {
            if (offset < 1) {
                throw new QueryOffsetError("The offset must be larger than 0");
            }
            queryParameter.push(`offset=${offset}`);
        }
        if (queryParameter.join("&").length > 1) {
            url += "?" + queryParameter.join("&");
        }
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "User Groups get" });
        const rawResult: any = await response.json();
        /*
        {
          ocs: {
            meta: {
              status: 'ok',
              statuscode: 100,
              message: 'OK',
              totalitems: '',
              itemsperpage: ''
            },
            data: { groups: ["g1", "g2"] }
          }
        }
        */
        const userGroups: string[] = [];

        if (rawResult.ocs &&
            rawResult.ocs.data &&
            rawResult.ocs.data.groups) {
            debug("groups", rawResult.ocs.data.groups);
            rawResult.ocs.data.groups.forEach((value: string) => {
                // userGroups.push(new UserGroup(this, value));
                userGroups.push(value);
            });
        }
        return userGroups;
    }

    /**
     * get user group
     * @param id string
     * @returns Promise<UserGroup|null>
     */
    public async getUserGroup(id: string): Promise<UserGroup | null> {
        const userGroups: UserGroup[] = await this.getUserGroups(id);
        if (userGroups[0]) {
            return userGroups[0];
        }
        return null
    }

    /**
     * returns a list of user ids that are members of the user group
     * @param id string
     * @returns list of member user ids
     * @throws [UserGroupDoesNotExistError}
     */
    public async getUserGroupMembers(id: string): Promise<string[]> {
        debug("getUserGroupMembers");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const url = this.getOcsUrl(`/groups/${id}`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "User group get members" });
        const rawResult: any = await response.json();
        const userIds: string[] = [];

        if (this.getOcsMetaStatus(rawResult).code === 404) {
            throw new UserGroupDoesNotExistError(`User Group ${id} does not exist`);
        }

        if (rawResult.ocs &&
            rawResult.ocs.data &&
            rawResult.ocs.data.users) {
            debug("members", rawResult.ocs.data.users);
            rawResult.ocs.data.users.forEach((value: string) => {
                userIds.push(value);
            });
        }

        return userIds;
    }

    /**
     * returns a list of user ids that are subadmins of the user group
     * @param id string
     * @returns list of subadmin user ids
     * @throws [UserGroupDoesNotExistError}
     */
    public async getUserGroupSubadmins(id: string): Promise<string[]> {
        debug("getUserGroupsubadmins");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const url = this.getOcsUrl(`/groups/${id}/subadmins`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "User group get subadmins" });
        const rawResult: any = await response.json();
        const userIds: string[] = [];

        if (this.getOcsMetaStatus(rawResult).code === 101) {
            throw new UserGroupDoesNotExistError(`User Group ${id} does not exist`);
        }

        if (rawResult.ocs &&
            rawResult.ocs.data) {
            debug("subadmins", rawResult.ocs.data);
            rawResult.ocs.data.forEach((value: string) => {
                userIds.push(value);
            });
        }

        return userIds;
    }

    /**
     * create a new user group
     * @async
     * @param {string} id user group id
     * @returns {Promise<UserGroup>}
     * @throws {UserGroupAlreadyExistsError}
     */
    public async createUserGroup(id: string): Promise<UserGroup> {
        debug("createUserGroup id=", id);
        const requestInit: RequestInit = {
            body: JSON.stringify({ groupid: id }),
            headers: this.getOcsHeaders(),
            method: "POST",
        };
        debug("request body: ", requestInit.body);
        const response: Response = await this.getHttpResponse(
            this.getOcsUrl(`/groups`),
            requestInit,
            [200],
            { description: "UserGroup create" });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 102) {
            throw new UserGroupAlreadyExistsError(`User Group ${id} already exists`);
        }

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return new UserGroup(this, id);
        }
        throw new OperationFailedError(`User group ${id} could not be created: ${this.getOcsMetaStatus(rawResult).message}`);
    }

    /**
     * deletes an existing user group
     * @param id string
     * @returns {Promise<void>}
     * @throws {UserGroupDowsNotExistError}
     * @throws {UserGroupDeletionFailedError}
     */
    public async deleteUserGroup(id: string): Promise<void> {
        debug("deleteUserGroup id=", id);
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "DELETE",
        };
        debug("request body: ", requestInit.body);
        const response: Response = await this.getHttpResponse(
            this.getOcsUrl(`/groups/${id}`),
            requestInit,
            [200],
            { description: "UserGroup delete" });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 101) {
            throw new UserGroupDoesNotExistError(`User Group ${id} does not exists`);
        }

        if (this.getOcsMetaStatus(rawResult).code === 102) {
            throw new UserGroupDeletionFailedError(`User Group ${id} could not be deleted`);
        }
    }

    // ***************************************************************************************
    // user
    // spec: https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/instruction_set_for_users.html
    // ***************************************************************************************

    /**
     * returns a list of users
     * https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/instruction_set_for_users.html#search-get-users
     * @param search string
     * @param limit number
     * @param offset number
     */
    public async getUsers(search?: string, limit?: number, offset?: number): Promise<User[]> {
        debug("getUsers");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        let url = this.getOcsUrl(`/users`);
        const queryParameter: string[] = [];
        if (search) {
            queryParameter.push(`search=${search}`);
        }
        if (limit) {
            if (limit < 1) {
                throw new QueryLimitError("The limit must be larger than 0");
            }
            queryParameter.push(`limit=${limit}`);
        }
        if (offset) {
            if (offset < 1) {
                throw new QueryOffsetError("The offset must be larger than 0");
            }
            queryParameter.push(`offset=${offset}`);
        }
        if (queryParameter.join("&").length > 1) {
            url += "?" + queryParameter.join("&");
        }
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "Users get" });
        const rawResult: any = await response.json();
        /*
        {
          ocs: {
            meta: {
              status: 'ok',
              statuscode: 100,
              message: 'OK',
              totalitems: '',
              itemsperpage: ''
            },
            data: { users: ["u1", "u2"] }
          }
        }
        */
        const users: User[] = [];

        if (rawResult.ocs &&
            rawResult.ocs.data &&
            rawResult.ocs.data.users) {
            debug("user ids", rawResult.ocs.data.users);
            rawResult.ocs.data.users.forEach((value: string) => {
                users.push(new User(this, value));
            });
        }

        return users;
    }

    /**
     * returns user data
     * @param id string the user id
     * @returns Promise<IUserOptions> user data
     * @throws {UserNotFoundError}
     */
    public async getUserData(id: string): Promise<IUserOptions> {
        debug("getUserData");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const url = this.getOcsUrl(`/users/${id}`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `User ${id} get` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 404) {
            throw new UserNotFoundError(`User '${id}' not found`);
        }
        /*
        {
          ocs: {
            meta: {
              status: 'ok',
              statuscode: 100,
              message: 'OK',
              totalitems: '',
              itemsperpage: ''
            },
            data: { ... }
          }
        }
        */

        let userData: IUserOptions;
        debug("user data", rawResult.ocs.data);
        userData = {
            enabled: rawResult.ocs.data.enabled,
            lastLogin: rawResult.ocs.data.lastLogin === 0 ? undefined : new Date(rawResult.ocs.data.lastLogin),
            subadminGroups: rawResult.ocs.data.subadmin,
            memberGroups: rawResult.ocs.data.groups,
            quota: {
                free: 0,
                used: 0,
                total: 0,
                relative: 0,
                quota: 0
            },
            email: rawResult.ocs.data.email,
            displayName: rawResult.ocs.data.displayname,
            phone: rawResult.ocs.data.phone,
            address: rawResult.ocs.data.address,
            website: rawResult.ocs.data.website,
            twitter: rawResult.ocs.data.twitter,
            language: rawResult.ocs.data.language,
            locale: rawResult.ocs.data.locale,
        };
        if (rawResult.ocs.data.quota.quota === 'none') {
            userData.quota = { quota: 0, relative: 0, used: 0 };
        } else {
            if (!rawResult.ocs.data.quota.relative) {
                rawResult.ocs.data.quota.relative = 0;
            }
            userData.quota = { quota: rawResult.ocs.data.quota.quota, relative: rawResult.ocs.data.quota.relative, used: rawResult.ocs.data.quota.used };
            if (rawResult.ocs.data.quota.free) {
                userData.quota.free = rawResult.ocs.data.quota.free;
            }
            if (rawResult.ocs.data.quota.total) {
                userData.quota.total = rawResult.ocs.data.quota.total;
            }
        }
        return userData;
    }

    /**
     * enables the user
     * @param id string the user id
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     */
    public async enableUser(id: string): Promise<void> {
        debug("enableUser");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "PUT",
        };

        const url = this.getOcsUrl(`/users/${id}/enable`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `User ${id} enable` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return
        }
        throw new UserNotFoundError(`User '${id}' not found`);
    }

    /**
     * disables the user
     * @param id string the user id
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     */
    public async disableUser(id: string): Promise<void> {
        debug("disableUser");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "PUT",
        };

        const url = this.getOcsUrl(`/users/${id}/disable`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `User ${id} disable` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return
        }
        throw new UserNotFoundError(`User '${id}' not found`);
    }

    /**
     * deletes the user
     * @param id string the user id
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     */
    public async deleteUser(id: string): Promise<void> {
        debug("deleteUser");
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "DELETE",
        };

        const url = this.getOcsUrl(`/users/${id}`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `User ${id} delete` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return
        }
        throw new UserNotFoundError(`User '${id}' not found`);
    }

    /**
     * returns a user or null if not found
     * @param id string
     * @returns User | null
     */
    public async getUser(id: string): Promise<User | null> {
        debug("getUser");
        const users: User[] = await this.getUsers(id);
        if (users[0]) {
            return users[0];
        }
        return null;
    }

    /**
     * creates a new user with email or password
     * @param options
     * @returns User
     * @throws UserAlreadyExistsError
     * @throws {UserNotFoundError}
     * @throws UserUpdateError
     */
    public async createUser(options: { id: string, email?: string, password?: string }): Promise<User> {
        debug("createUser");
        const createUserBody: { userid: string, password?: string, email?: string } = { userid: options.id };
        if (options.email) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.email)) {
                createUserBody.email = options.email;
            } else {
                throw new UserCreateError(`Error creating user '${options.id}' - invalid email address '${options.email}'`);
            }
        }
        if (options.password) {
            createUserBody.password = options.password;
        }

        const requestInit: RequestInit = {
            body: JSON.stringify(createUserBody, null, 4),
            headers: this.getOcsHeaders(),
            method: "POST",
        };
        debug("request body: ", requestInit.body);
        const response: Response = await this.getHttpResponse(
            this.getOcsUrl(`/users`),
            requestInit,
            [200],
            { description: `User ${options.id} create` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 102) {
            throw new UserAlreadyExistsError(`User with id '${options.id}' already exists`);
        }

        const user: User | null = await this.getUser(options.id);
        if (user) {
            return user;
        }

        throw new UserCreateError(`Error creating user '${options.id}' - ${this.getOcsMetaStatus(rawResult).message} (${this.getOcsMetaStatus(rawResult).code})`);
    }

    /**
     * updates a user property
     * @async
     * @param {string} id user id
     * @param {UserProperty} property property name
     * @param {string} value property value
     * @returns {Promise<void>}
     * @throws  {UserNotFoundError}
     * @throws  {UserUpdateError}
     */
    public async updateUserProperty(id: string, property: UserProperty, value: string): Promise<void> {
        debug("updateUserProperty");
        const body: { key: string, value: string } = { key: property, value };

        const requestInit: RequestInit = {
            body: JSON.stringify(body, null, 4),
            headers: this.getOcsHeaders(),
            method: "PUT",
        };
        const url = this.getOcsUrl(`/users/${id}`);
        debug("request body: ", requestInit.body);
        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200, 401],
            { description: `User ${id} update ${property}=${value}` });
        const rawResult: any = await response.json();

        // This service operation returns a 401, if the user does not exist - very strange...
        // spec says to return 200 and status code 101
        /*
        if (this.getOcsMetaStatus(rawResult).code === 101) {
            throw new UserNotFoundError(`User with id '${id}' not found`);
        }
        */
        // maybe this is due to a nextcloud api error
        // it is not possible to distiguish beteen authentication error and user not found :-(
        if (response.status === 401) {
            throw new UserNotFoundError(`User with id '${id}' not found`);
        }

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return;
        }

        if (property === UserProperty.password) {
            value = "********";
        }
        // code 102 or 103
        throw new UserUpdateError(`User with id '${id}' could not be updated - ${property}=${value}. ${rawResult.ocs.meta.message}`);
    }

    /**
     * resend the welcome email
     * @param id user id
     * @throws  {UserResendWelcomeEmailError}
     */
    public async resendWelcomeEmail(id: string, ): Promise<void> {
        debug("resendWelcomeEmail");

        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "POST",
        };
        const url = this.getOcsUrl(`/users/${id}/welcome`);
        debug("request body: ", requestInit.body);
        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `Resend welcome email for user ${id}` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 101) {
            throw new UserResendWelcomeEmailError(`Error sending welcome email for '${id}': Email address not available`);
        }

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return;
        }
        throw new UserResendWelcomeEmailError(`Error sending welcome email for '${id}' failed`);
    }

    /**
     * adds a user to a group as member
     * @param id string the user id
     * @param userGroupId string the user group id
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    public async addUserToMemberUserGroup(id: string, userGroupId: string): Promise<void> {
        debug("addUserToUserGroup");

        const body: { groupid: string } = { groupid: userGroupId };
        const requestInit: RequestInit = {
            body: JSON.stringify(body, null, 4),
            headers: this.getOcsHeaders(),
            method: "POST",
        };

        const url = this.getOcsUrl(`/users/${id}/groups`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `Add user ${id} to user group ${userGroupId}` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return
        }

        if (this.getOcsMetaStatus(rawResult).code === 102) {
            throw new UserGroupDoesNotExistError(`User group ${userGroupId} does not exist`)
        }

        if (this.getOcsMetaStatus(rawResult).code === 103) {
            throw new UserNotFoundError(`User ${id} does not exist`)
        }

        if (this.getOcsMetaStatus(rawResult).code === 104) {
            throw new InsufficientPrivilegesError(`Insufficient privileges to add a user to a group`);
        }

        throw new OperationFailedError(`User ${id} could not be added to user group ${userGroupId}: ${this.getOcsMetaStatus(rawResult).message}`);
    }

    /**
     * removes a user from a group as member
     * @param id string the user id
     * @param userGroupId string the user group id
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    public async removeUserFromMemberUserGroup(id: string, userGroupId: string): Promise<void> {
        debug("removeUserFromMemberUserGroup");

        const body: { groupid: string } = { groupid: userGroupId };
        const requestInit: RequestInit = {
            body: JSON.stringify(body, null, 4),
            headers: this.getOcsHeaders(),
            method: "DELETE",
        };

        const url = this.getOcsUrl(`/users/${id}/groups`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `Remove user ${id} from user group ${userGroupId}` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return
        }

        if (this.getOcsMetaStatus(rawResult).code === 102) {
            throw new UserGroupDoesNotExistError(`User group ${userGroupId} does not exist`)
        }

        if (this.getOcsMetaStatus(rawResult).code === 103) {
            throw new UserNotFoundError(`User ${id} does not exist`)
        }

        if (this.getOcsMetaStatus(rawResult).code === 104) {
            throw new InsufficientPrivilegesError(`Insufficient privileges to add a user to a group`);
        }

        throw new OperationFailedError(`User ${id} could not be added to user group ${userGroupId}: ${this.getOcsMetaStatus(rawResult).message}`);
    }

    /**
     * promotes a user to a user group subadmin
     * @param id string the user id
     * @param userGroupId string the user group id
     * @returns {Promise<void>}
     * @throws {UserNotFoundError}
     * @throws {UserGroupDoesNotExistError}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    public async promoteUserToUserGroupSubadmin(id: string, userGroupId: string): Promise<void> {
        debug("promoteUserToUserGroupSubadmin");

        const body: { groupid: string } = { groupid: userGroupId };
        const requestInit: RequestInit = {
            body: JSON.stringify(body, null, 4),
            headers: this.getOcsHeaders(),
            method: "POST",
        };

        const url = this.getOcsUrl(`/users/${id}/subadmins`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `Promote User ${id} to user group subadmin ${userGroupId}` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return
        }

        if (this.getOcsMetaStatus(rawResult).code === 102) {
            throw new UserGroupDoesNotExistError(`User group ${userGroupId} does not exist`)
        }

        if (this.getOcsMetaStatus(rawResult).code === 101) {
            throw new UserNotFoundError(`User ${id} does not exist`)
        }

        if (this.getOcsMetaStatus(rawResult).code === 104) {
            throw new InsufficientPrivilegesError(`Insufficient privileges to add a user to a group`);
        }

        throw new OperationFailedError(`User ${id} could not be removed from user group ${userGroupId}: ${this.getOcsMetaStatus(rawResult).message}`);
    }

    /**
     * Removes the subadmin rights for the user specified from the group specified
     * @param id string the user id
     * @param userGroupId string the user group id
     * @returns {Promise<void>}
     * @throws {InsufficientPrivilegesError}
     * @throws {OperationFailedError}
     */
    public async demoteUserFromSubadminUserGroup(id: string, userGroupId: string): Promise<void> {
        debug("demoteUserFromSubadminUserGroup");

        const body: { groupid: string } = { groupid: userGroupId };
        const requestInit: RequestInit = {
            body: JSON.stringify(body, null, 4),
            headers: this.getOcsHeaders(),
            method: "DELETE",
        };

        const url = this.getOcsUrl(`/users/${id}/subadmins`);
        debug("url ", url)

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: `Demotes user ${id} from subadmin user group ${userGroupId}` });
        const rawResult: any = await response.json();

        if (this.getOcsMetaStatus(rawResult).code === 100) {
            return
        }

        // this API does not work like remove from group :-(
        // 101 is for user group not found and user not found
        /*
            if (this.getOcsMetaStatus(rawResult).code === 101) {
                throw new UserGroupDoesNotExistError(`User group ${userGroupId} does not exist`)
            }

            if (this.getOcsMetaStatus(rawResult).code === 101) {
                throw new UserNotFoundError(`User ${id} does not exist`)
            }
        */
        if (this.getOcsMetaStatus(rawResult).code === 104) {
            throw new InsufficientPrivilegesError(`Insufficient privileges to add a user to a group`);
        }

        throw new OperationFailedError(`User ${id} could not be demoted from subadmin user group ${userGroupId}: ${this.getOcsMetaStatus(rawResult).message}`);
    }


    /**
     * insert or update complete user data
     * @param options IUpsertUserOptions[]
     * @returns Promise<IUpsertUserReport[]
     */
    public async upsertUsers(options: IUpsertUserOptions[]): Promise<IUpsertUserReport[]> {
        const report: IUpsertUserReport[] = [];
        for (const option of options) {
            const userReport: IUpsertUserReport = { id: option.id, message: "", changes: [] };
            let user: User | null = await this.getUser(option.id);
            // create or update user?

            if (!user) {
                try {
                    user = await this.createUser({ id: option.id, email: option.email, password: option.password })
                    userReport.message = `User ${option.id} created`;
                } catch (e) {
                    userReport.message = `Create user ${option.id} failed ${e.message}`;
                    report.push(userReport);
                    continue;
                }
            } else {
                userReport.message = `User ${option.id} changed`;
            }

            let previousValue: string = "";
            let newValue: string = "";
            let property: string = "";

            // ************************
            // enabled
            // ************************
            if (option.enabled !== undefined) {
                if (await user.isEnabled() && option.enabled === false) {
                    try {
                        await user.disable();
                        userReport.changes.push({ property: "enabled", previousValue: "true", newValue: "false" });
                    } catch (e) {
                        userReport.changes.push({ property: "enabled", previousValue: "true", newValue: "true", error: e.message });
                    }
                }

                if (await user.isEnabled() === false && option.enabled === true) {
                    try {
                        await user.enable();
                        userReport.changes.push({ property: "enabled", previousValue: "false", newValue: "true" });
                    } catch (e) {
                        userReport.changes.push({ property: "enabled", previousValue: "false", newValue: "false", error: e.message });
                    }
                }
            }

            // ************************
            // super admin
            // ************************
            if (option.superAdmin !== undefined) {
                if (await user.isSuperAdmin() && option.superAdmin === false) {
                    try {
                        await user.demoteFromSuperAdmin();
                        userReport.changes.push({ property: "superAdmin", previousValue: "true", newValue: "false" });
                    } catch (e) {
                        userReport.changes.push({ property: "superAdmin", previousValue: "true", newValue: "true", error: e.message });
                    }
                }

                if (await user.isSuperAdmin() === false && option.superAdmin === true) {
                    try {
                        await user.promoteToSuperAdmin();
                        userReport.changes.push({ property: "superAdmin", previousValue: "false", newValue: "true" });
                    } catch (e) {
                        userReport.changes.push({ property: "superAdmin", previousValue: "false", newValue: "false", error: e.message });
                    }
                }
            }

            // ************************
            // member groups
            // ************************
            if (option.memberGroups !== undefined) {
                const previousGroups: string[] = await user.getMemberUserGroupIds()
                const newGroups: string[] = option.memberGroups;
                if (option.superAdmin !== undefined) {
                    if (option.superAdmin === true) {
                        if (newGroups.indexOf("admin") === -1) {
                            newGroups.push("admin");
                        }
                    }
                }
                const groupsToAdd: string[] = newGroups.filter(x => !previousGroups.includes(x));
                const groupsToRemove: string[] = previousGroups.filter(x => !newGroups.includes(x));
                let userGroup: UserGroup | null;
                property = "memberGroups";
                let error: Error | null = null;
                for (const groupId of groupsToAdd) {
                    userGroup = await this.getUserGroup(groupId)
                    if (!userGroup) {
                        try {
                            userGroup = await this.createUserGroup(groupId)
                        } catch (e) {
                            error = e;
                            break;
                        }
                    }
                    try {
                        await user.addToMemberUserGroup(userGroup);
                    } catch (e) {
                        error = e;
                        break;
                    }
                }

                for (const groupId of groupsToRemove) {
                    try {
                        await user.removeFromMemberUserGroup(new UserGroup(this, groupId));
                    } catch (e) {
                        error = e;
                        break;
                    }
                }
                if (error) {
                    userReport.changes.push({ property, previousValue: previousGroups.join(", "), newValue: previousGroups.join(", "), error: error.message });
                } else {
                    if (groupsToAdd.length > 0 || groupsToRemove.length > 0) {
                        userReport.changes.push({ property, previousValue: previousGroups.join(", "), newValue: newGroups.join(", ") });
                    }
                }

            }

            // ************************
            // subadmin groups
            // ************************
            if (option.subadminGroups !== undefined) {
                const previousGroups: string[] = await user.getSubadminUserGroupIds()
                const newGroups: string[] = option.subadminGroups;
                const groupsToAdd: string[] = newGroups.filter(x => !previousGroups.includes(x));
                const groupsToRemove: string[] = previousGroups.filter(x => !newGroups.includes(x));
                let userGroup: UserGroup | null;
                property = "subadminGroups";
                let error: Error | null = null;
                for (const groupId of groupsToAdd) {
                    userGroup = await this.getUserGroup(groupId)
                    if (!userGroup) {
                        try {
                            userGroup = await this.createUserGroup(groupId)
                        } catch (e) {
                            error = e;
                            break;
                        }
                    }
                    try {
                        await user.promoteToUserGroupSubadmin(userGroup);
                    } catch (e) {
                        error = e;
                        break;
                    }
                }

                for (const groupId of groupsToRemove) {
                    try {
                        await user.demoteFromSubadminUserGroup(new UserGroup(this, groupId));
                    } catch (e) {
                        error = e;
                        break;
                    }
                }
                if (error) {
                    userReport.changes.push({ property, previousValue: previousGroups.join(", "), newValue: previousGroups.join(", "), error: error.message });
                } else {
                    userReport.changes.push({ property, previousValue: previousGroups.join(", "), newValue: newGroups.join(", ") });
                }

            }

            // ************************
            // display name
            // ************************
            if (option.displayName !== undefined) {
                previousValue = await user.getDisplayName();
                newValue = option.displayName
                property = "displayName";
                if (previousValue !== newValue) {
                    try {
                        await user.setDisplayName(option.displayName);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // email
            // ************************
            if (option.email !== undefined) {
                previousValue = await user.getEmail();
                newValue = option.email;
                property = "email";
                if (previousValue !== newValue) {
                    try {
                        await user.setEmail(option.email);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // language
            // ************************
            if (option.language !== undefined) {
                previousValue = await user.getLanguage();
                newValue = option.language;
                property = "language";
                if (previousValue !== newValue) {
                    try {
                        await user.setLanguage(option.language);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // locale
            // ************************
            if (option.locale !== undefined) {
                previousValue = await user.getLocale();
                newValue = option.locale;
                property = "locale";
                if (previousValue !== newValue) {
                    try {
                        await user.setLocale(option.locale);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // twitter
            // ************************
            if (option.twitter !== undefined) {
                previousValue = await user.getTwitter();
                newValue = option.twitter;
                property = "twitter";
                if (previousValue !== newValue) {
                    try {
                        await user.setTwitter(option.twitter);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // phone
            // ************************
            if (option.phone !== undefined) {
                previousValue = await user.getPhone();
                newValue = option.phone;
                property = "phone";
                if (previousValue !== newValue) {
                    try {
                        await user.setPhone(option.phone);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // password
            // ************************
            if (option.password !== undefined) {
                previousValue = "********";
                newValue = option.password;
                property = "password";
                try {
                    await user.setPassword(option.password);
                    userReport.changes.push({ property, previousValue, newValue: previousValue });
                } catch (e) {
                    userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                }
            }

            // ************************
            // address
            // ************************
            if (option.address !== undefined) {
                previousValue = await user.getAddress();
                newValue = option.address;
                property = "address";
                if (previousValue !== newValue) {
                    try {
                        await user.setAddress(option.address);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // website
            // ************************
            if (option.website !== undefined) {
                previousValue = await user.getWebsite();
                newValue = option.website;
                property = "website";
                if (previousValue !== newValue) {
                    try {
                        await user.setWebsite(option.website);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // quota
            // ************************
            if (option.quota !== undefined) {
                previousValue = await (await user.getQuotaUserFriendly()).quota;
                newValue = option.quota;
                property = "quota";
                if (previousValue !== newValue) {
                    try {
                        await user.setQuota(option.quota);
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            // ************************
            // resend welcome email
            // ************************
            if (option.resendWelcomeEmail !== undefined) {
                previousValue = "not sent";
                newValue = "sent";
                property = "resendWelcomeEmail";
                if (option.resendWelcomeEmail) {
                    try {
                        await user.resendWelcomeEmail();
                        userReport.changes.push({ property, previousValue, newValue });
                    } catch (e) {
                        userReport.changes.push({ property, previousValue, newValue: previousValue, error: e.message });
                    }
                }
            }

            if (userReport.changes.length === 0) {
                userReport.message = `User ${option.id} not changed`;
            }
            report.push(userReport);
        }
        return report;
    }

    // ***************************************************************************************
    // shares
    // https://docs.nextcloud.com/server/latest/developer_manual/client_apis/OCS/ocs-share-api.html
    // ***************************************************************************************

    /**
     * create a new share
     */
    public async createShare(options: ICreateShare): Promise<Share> {

        const shareRequest = Share.createShareRequestBody(options);
        debug(shareRequest);

        const requestInit: RequestInit = {
            body: shareRequest,
            headers: this.getOcsHeaders(),
            method: "POST",
        };
        const url = this.nextcloudOrigin + "/ocs/v2.php/apps/files_sharing/api/v1/shares";

        // try {
        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "Share create" });

        const rawResult: any = await response.json();
        debug(rawResult);
        return Share.getShare(this, rawResult.ocs.data.id);
        /* } catch (e) {
            debug("result " + e.message);
            debug("requestInit ", JSON.stringify(requestInit, null, 4));
            debug("headers " + JSON.stringify(headers, null, 4));
            debug("url ", url);
            throw e;
        } */
    }

    /**
     * update a new share
     */
    public async updateShare(shareId: string, body: { password: string } | { expireDate: string } | { note: string }): Promise<void> {

        debug("updateShare body ", body);

        const requestInit: RequestInit = {
            body: JSON.stringify(body, null, 4),
            headers: this.getOcsHeaders(),
            method: "PUT",
        };
        const url = this.nextcloudOrigin + "/ocs/v2.php/apps/files_sharing/api/v1/shares/" + shareId;

        await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "Share update" });

    }

    /**
     * get share information
     * @param shareId
     */
    public async getShare(shareId: string): Promise<any> {

        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };
        const url = this.nextcloudOrigin + "/ocs/v2.php/apps/files_sharing/api/v1/shares/" + shareId;

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "Share get" });

        const rawResult: any = await response.json();
        return rawResult;
        /*
    } catch (e) {
        debug("result " + e.message);
        debug("requestInit ", JSON.stringify(requestInit, null, 4));
        debug("headers " + JSON.stringify(headers, null, 4));
        debug("url ", url);
        throw e;
    }
    */
    }

    /**
     * get share information
     * @param shareId
     */
    public async deleteShare(shareId: string): Promise<any> {

        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "DELETE",
        };
        const url = this.nextcloudOrigin + "/ocs/v2.php/apps/files_sharing/api/v1/shares/" + shareId;

        const response: Response = await this.getHttpResponse(
            url,
            requestInit,
            [200],
            { description: "Share delete" });

    }

    // ***************************************************************************************
    // notfication management
    // ***************************************************************************************
    /**
     * @returns array of notification objects
     */
    public async getNotifications(): Promise<object[]> {
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + "/ocs/v2.php/apps/notifications/api/v2/notifications",
            requestInit,
            [200, 404],
            { description: "Notifications get" });

        // no notification found
        if (response.status === 404) {
            return [];
        }

        const rawResult: any = await response.json();

        let notifications = [];

        if (rawResult && rawResult.ocs && rawResult.ocs.data) {
            notifications = rawResult.ocs.data;
        } else {
            throw new ClientError("Fatal Error: nextcloud notifications data missing", "ERR_SYSTEM_INFO_MISSING_DATA"); // @todo wrong error message
        }

        const result: object[] = notifications;
        return result;
    }

    public async getUpdateNotifications(version: string): Promise<object> {

        // @todo refactoring... /ocs/v2.php/apps/notifications/api/v2/notifications/<id>   (GET/DELETE)

        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + `/ocs/v2.php/apps/updatenotification/api/v1/applist/${version}`,
            requestInit,
            [200],
            { description: "UpdateNotifications get" });

        const rawResult: any = await response.json();

        let updateNotification = {};

        if (rawResult && rawResult.ocs && rawResult.ocs.data) {
            updateNotification = rawResult.ocs.data;
        } else {
            throw new ClientError("Fatal Error: nextcloud notifications data missing", "ERR_SYSTEM_INFO_MISSING_DATA");
        }

        const result: object = updateNotification;
        return result;
    }

    // @todo to be refactored to user
    public async sendNotificationToUser(userId: string, shortMessage: string, longMessage?: string): Promise<void> {
        const requestInit: RequestInit = {
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "OCS-APIRequest": "true",
            }),
            method: "POST",
        };

        if (!longMessage) {
            longMessage = "";
        }
        longMessage = `&longMessage=${encodeURIComponent(longMessage)}`;
        const queryString = `${encodeURIComponent(userId)}?shortMessage=${encodeURIComponent(shortMessage)}${longMessage}`;
        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + `/ocs/v2.php/apps/admin_notifications/api/v1/notifications/${queryString}`,
            requestInit,
            [200],
            { description: "User create" });
        const rawResult: any = await response.json();
        //        console.log(rawResult);
    }

    // ***************************************************************************************
    // apps management
    // ***************************************************************************************
    /**
     * returns apps
     */
    public async getApps(): Promise<string[]> {
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.getOcsUrl(`/apps`),
            requestInit,
            [200],
            { description: "Apps get" });

        const rawResult: any = await response.json();

        let apps = [];

        if (rawResult && rawResult.ocs && rawResult.ocs.data) {
            apps = rawResult.ocs.data;
        } else {
            throw new ClientError("Fatal Error: nextcloud apps data missing", "ERR_SYSTEM_INFO_MISSING_DATA");
        }

        const result: string[] = apps;

        return result;
    }
    public async getAppInfos(appName: string): Promise<object> {
        const requestInit: RequestInit = {
            headers: this.getOcsHeaders(),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.getOcsUrl(`/apps/${appName}`),
            requestInit,
            [200],
            { description: "App Infos get" });

        const rawResult: any = await response.json();

        let appInfo = {};

        if (rawResult && rawResult.ocs && rawResult.ocs.data) {
            appInfo = rawResult.ocs.data;
        } else {
            throw new ClientError("Fatal Error: nextcloud apps data missing", "ERR_SYSTEM_INFO_MISSING_DATA");
        }

        const result: object = appInfo;

        return result;
    }

    // ***************************************************************************************
    // private methods
    // ***************************************************************************************

    /**
     * asserts valid xml
     * asserts multistatus response
     * asserts that a href is available in the multistatus response
     * asserts propstats and prop
     * @param response the http response
     * @param href get only properties that match the href
     * @returns array of properties
     * @throws GeneralError
     */
    private async getPropertiesFromWebDAVMultistatusResponse(response: Response, href: string): Promise<any[]> {
        const responseContentType: string | null = response.headers.get("Content-Type");

        if (!responseContentType) {
            throw new ClientError("Response content type expected", "ERR_RESPONSE_WITHOUT_CONTENT_TYPE_HEADER");
        }

        if (responseContentType.indexOf("application/xml") === -1) {
            throw new ClientError("XML response content type expected", "ERR_XML_RESPONSE_CONTENT_TYPE_EXPECTED");
        }

        const xmlBody: string = await response.text();

        if (parser.validate(xmlBody) !== true) {
            throw new ClientError(`The response is not valid XML: ${xmlBody}`, "ERR_RESPONSE_NOT_INVALID_XML");
        }
        const options: any = {
            ignoreNameSpace: true,
        };
        const body: any = parser.parse(xmlBody, options);

        // ensure that we have a multistatus response
        if (!body.multistatus || !body.multistatus.response) {
            throw new ClientError(`The response is is not a WebDAV multistatus response`, "ERR_RESPONSE_NO_MULTISTATUS_XML");
        }

        // ensure that response is always an array
        if (body.multistatus.response.href || body.multistatus.response.propstat) {
            body.multistatus.response = new Array(body.multistatus.response);
        }
        /*
                if (body.multistatus.response.propstat) {
                    body.multistatus.response = [body.multistatus.response];
                }
        */
        const responseProperties: any[] = [];
        for (const res of body.multistatus.response) {

            if (!res.href) {
                throw new ClientError(`The mulitstatus response must have a href`, "ERR_RESPONSE_MISSING_HREF_MULTISTATUS");
            }

            if (!res.propstat) {
                throw new ClientError(`The mulitstatus response must have a "propstat" container`, "ERR_RESPONSE_MISSING_PROPSTAT");
            }
            let propStats = res.propstat;

            // ensure an array
            if (res.propstat.status || res.propstat.prop) {
                propStats = [res.propstat];
            }

            for (const propStat of propStats) {
                if (!propStat.status) {
                    throw new ClientError(`The propstat must have a "status"`, "ERR_RESPONSE_MISSING_PROPSTAT_STATUS");
                }
                if (propStat.status === "HTTP/1.1 200 OK") {
                    if (!propStat.prop) {
                        throw new ClientError(`The propstat must have a "prop"`, "ERR_RESPONSE_MISSING_PROPSTAT_PROP");
                    }
                    const property: any = propStat.prop;
                    property._href = res.href;
                    responseProperties.push(property);
                }
            }
            //            }
        }
        return responseProperties;
    }

    /**
     * nextcloud creates a csrf token and stores it in the html header attribute
     * data-requesttoken
     * this function is currently not used
     * @returns the csrf token / requesttoken
     */
    /*
        private async getCSRFToken(): Promise<string> {

            const requestInit: RequestInit = {
                method: "GET",
            };

            const response: Response = await this.getHttpResponse(
                this.nextcloudOrigin,
                requestInit,
                [200],
                { description: "CSER token get" });

            const html = await response.text();

            const requestToken: string = html.substr(html.indexOf("data-requesttoken=") + 19, 89);
            debug("getCSRFToken  %s", requestToken);
            return requestToken;
        }
    */

    private async getHttpResponse(url: string, requestInit: RequestInit, expectedHttpStatusCode: number[], context: IRequestContext): Promise<Response> {

        if (!requestInit.headers) {
            requestInit.headers = new Headers();
        }

        /* istanbul ignore else */
        if (this.fakeServer) {
            return await this.fakeServer.getFakeHttpResponse(url, requestInit, expectedHttpStatusCode, context);
        } else {
            return await this.httpClient!.getHttpResponse(url, requestInit, expectedHttpStatusCode, context);
        }
    }

    /**
     * get contents array of a folder
     * @param folderName Name of the folder like "/company/branches/germany"
     * @param folderIndicator true if folders are requested otherwise files
     * @returns array of folder contents meta data
     */
    private async Contents(folderName: string, folderIndicator: boolean): Promise<any[]> {
        debug("Contents: folder %s", folderName);
        const folders: Folder[] = [];
        folderName = this.sanitizeFolderName(folderName);
        const resultArray: any[] = [];

        if (folderIndicator === true) {
            debug("Contents: get folders");
        } else {
            debug("Contents: get files");
        }
        try {
            const folderContentsArray = await this.getFolderContents(folderName);

            // debug("###########################");
            // debug("$s", JSON.stringify(folderContentsArray, null, 4));
            // debug("###########################");

            for (const folderElement of folderContentsArray) {
                if (folderElement.type === "directory") {
                    if (folderIndicator === true) {
                        resultArray.push(folderElement);
                    }
                } else {
                    if (folderIndicator === false) {
                        debug("Contents folder element file %O ", folderElement);
                        resultArray.push(folderElement);
                    }
                }
            }
        } catch (e) {
            debug("Contents: exception occurred %s", e.message);
        }

        return resultArray;
    }

    private sanitizeFolderName(folderName: string): string {
        if (folderName[0] !== "/") {
            folderName = "/" + folderName;
        }
        // remove trailing "/" es
        folderName = folderName.replace(/\/+$/, "");
        if (folderName === "") {
            folderName = "/";
        }

        return folderName;
    }

    private getTagIdFromHref(href: string): number {
        return parseInt(href.split("/")[href.split("/").length - 1], 10);
    }

    private async createFolderInternal(folderName: string): Promise<void> {

        const url: string = this.webDAVUrl + folderName;
        debug("createFolderInternal %s", url);

        const requestInit: RequestInit = {
            method: "MKCOL",
        };
        try {
            await this.getHttpResponse(
                url,
                requestInit,
                [201],
                { description: "Folder create" },
            );

        } catch (err) {
            debug("Error in createFolderInternal %s %s %s %s", err.message, requestInit.method, url);
            throw err;
        }
    }

    private async stat(fileName: string): Promise<IStat> {

        const url: string = this.webDAVUrl + fileName;
        debug("stat %s", url);

        const requestInit: RequestInit = {
            body: `<?xml version="1.0"?>
            <d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
            <d:prop>
                  <d:getlastmodified />
                  <d:getetag />
                  <d:getcontenttype />
                  <d:resourcetype />
                  <oc:fileid />
                  <oc:permissions />
                  <oc:size />
                  <d:getcontentlength />
                  <nc:has-preview />
                  <oc:favorite />
                  <oc:comments-unread />
                  <oc:owner-display-name />
                  <oc:share-types />
            </d:prop>
          </d:propfind>`,
            headers: new Headers({ Depth: "0" }),
            method: "PROPFIND",
        };
        let response: Response;
        try {
            response = await this.getHttpResponse(
                url,
                requestInit,
                [207],
                { description: "File/Folder get details" },
            );

        } catch (err) {
            debug("Error in stat %s %s %s %s", err.message, requestInit.method, url);
            throw err;
        }

        const properties: any[] = await this.getPropertiesFromWebDAVMultistatusResponse(response, "");
        let resultStat: IStat | null = null;

        for (const prop of properties) {
            resultStat = {
                basename: basename(fileName),
                fileid: prop.fileid,
                filename: fileName,
                lastmod: prop.getlastmodified,
                type: "file",
            };

            if (prop.getcontentlength) {
                resultStat.size = prop.getcontentlength;
            } else {
                resultStat.type = "directory";
            }

            if (prop.getcontenttype) {
                resultStat.mime = prop.getcontenttype;
            }
        }

        if (!resultStat) {
            debug("Error: response %s", JSON.stringify(properties, null, 4));
            throw new ClientError("Error getting status information from : " + url,
                "ERR_STAT");
        }
        return resultStat;
    }

    private getOcsMetaStatus(input: any): { code: number, message: string } {
        let code: number;
        let message: string = "";
        if (input.ocs &&
            input.ocs.meta &&
            input.ocs.meta.statuscode) {
            code = input.ocs.meta.statuscode;
            if (input.ocs.meta.message) {
                message = input.ocs.meta.message;
            }
            return { code, message }
        }
        throw new InvalidServiceResponseFormatError("Fatal Error: The OCS meta status could not be retrieved from OCS response");
    }

    private getOcsHeaders(): Headers {
        return new Headers({
            "OCS-APIRequest": "true",
            "Content-Type": "application/json",
            "Accept": "application/json"
        });
    }

    private getOcsUrl(suffix: string): string {
        /*
        if (!suffix) {
            suffix = "";
        }
        if (!suffix.startsWith("/")) {
            suffix = `/${suffix}`
        }
        */
        return `${this.nextcloudOrigin}/ocs/v1.php/cloud${suffix}`;
    }

    private async putFileContents(fileName: string, data: Buffer | NodeJS.ReadableStream): Promise<Response> {

        const url: string = this.webDAVUrl + fileName;
        debug("putFileContents %s", url);

        const requestInit: RequestInit = {
            body: data,
            method: "PUT",
        };
        let response: Response;
        let description = "File save content ";
        if (data instanceof Buffer) {
            description += "from buffer";
        } else {
            description += "from stream";
        }
        response = await this.getHttpResponse(
            url,
            requestInit,
            [201, 204],
            { description },
        );

        return response;
    }

}
