// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import debugFactory from "debug";
import parser from "fast-xml-parser";

import HttpProxyAgent from "http-proxy-agent";

import {
    Headers,
    RequestInit,
    Response,
} from "node-fetch";
import fetch from "node-fetch";
import path, { basename } from "path";
import NCError from "./ncError";
import NCFile from "./ncFile";
import NCFolder from "./ncFolder";
import NCTag from "./ncTag";
import { isArray } from "util";

export {
    NCClient,
    NCError,
    NCFolder,
    NCFile,
    NCTag,
};

const debug = debugFactory("NCClient");

// debug("process env %O", process.env);

export interface IBasicAuth {
    "username": string;
    "password": string;
}

export interface IProxy {
    "host": string;
    "port": string;
    "protocol": string;
    "secureProxy": boolean;
    "proxyAuthorizationHeader"?: string;
}

export interface ICredentials {
    "url": string;
    "basicAuth": IBasicAuth;
}

interface IStat {
    "type": string;
    "filename": string;
    "basename": string;
    "lastmod": string;
    "size"?: number;
    "mime"?: string;
    "fileid"?: number;
}

export default class NCClient {

    /**
     * returns the nextcloud credentials that is defined in the
     * "user-provided" service section of the VCAP_SERVICES environment
     * @param instanceName the name of the nextcloud user provided service instance
     * @returns credentials from the VCAP_SERVICES environment (user provided service)
     */
    public static getCredentialsFromEnv(instanceName: string): ICredentials {

        if (!process.env.VCAP_SERVICES) {
            throw new NCError("NCClient getCredentials: environment VCAP_SERVICES not found", "ERR_VCAP_SERVICES_NOT_FOUND");
        }

        const vcapServices = require("vcap_services");
        const cred = vcapServices.getCredentials("user-provided", null, instanceName);

        if (!cred || cred === undefined || (!cred.url && !cred.username && !cred.password && !cred.password)) {
            debug("NCClient: error credentials not found or not fully specified %O", cred);
            throw new NCError(`NCClient getCredentials: nextcloud credentials not found in environment VCAP_SERVICES. Service section: "user-provided", service instance name: "${instanceName}" `, "ERR_VCAP_SERVICES_NOT_FOUND");
        }

        if (!cred.url) {
            throw new NCError("NCClient getCredentials: VCAP_SERVICES url not defined in user provided services for nextcloud"
                , "ERR_VCAP_SERVICES_URL_NOT_DEFINED",
                { credentials: cred });
        }

        if (!cred.password) {
            throw new NCError("NCClient getCredentials VCAP_SERVICES password not defined in user provided services for nextcloud",
                "ERR_VCAP_SERVICES_PASSWORD_NOT_DEFINED",
                { credentials: cred });
        }

        if (!cred.username) {
            throw new NCError("NCClient getCredentials VCAP_SERVICES username not defined in user provided services for nextcloud",
                "ERR_VCAP_SERVICES_USERNAME_NOT_DEFINED",
                { credentials: cred });
        }

        return {
            basicAuth:
                { username: cred.username, password: cred.password },
            url: cred.url,
        };
    }

    private nextcloudOrigin: string;
    private nextcloudAuthHeader: string;
    private nextcloudRequestToken: string;
    private webDAVUrl: string;
    private proxy?: IProxy;

    /**
     * constructor of the nextcloud client
     * @param url the WebDAV url of the nextcloud server
     * @param authentication basic authentication information
     * @param proxyAgent the proxy agent optional
     */
    public constructor(url: string, authentication: IBasicAuth, proxy?: IProxy) {
        debug("constructor");

        this.proxy = proxy;

        debug("constructor: webdav url %s", url);

        if (url.indexOf("remote.php/webdav") === -1) {
            // not a valid nextcloud url
            throw new NCError(`The provided nextcloud url "${url}" does not comply to the nextcloud url standard, "remote.php/webdav" is missing`,
                "ERR_INVALID_NEXTCLOUD_WEBDAV_URL");
        }
        this.nextcloudOrigin = url.substr(0, url.indexOf("/remote.php/webdav"));

        debug("constructor: nextcloud url %s", this.nextcloudOrigin);

        this.nextcloudAuthHeader = "Basic " + Buffer.from(authentication.username + ":" + authentication.password).toString("base64");
        this.nextcloudRequestToken = "";
        if (url.slice(-1) === "/") {
            this.webDAVUrl = url.slice(0, -1);
        } else {
            this.webDAVUrl = url;
        }

    }

    /**
     * 
     * returns the used and free quota of the nextcloud account
     */
    public async getQuota() {
        debug("getQuota");
        const requestInit: RequestInit = {
            method: "PROPFIND",
        };

        const response: Response = await this.getHttpResponse(
            this.webDAVUrl + "/",
            requestInit,
            [207]);

        const responseObject: any = await this.getParseXMLFromResponse(response);

        if (!responseObject.multistatus) {
            throw new NCError("Response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED");
        }
        // debug(JSON.stringify(responseObject, null, 4));
        if (responseObject.multistatus.response.href) {
            responseObject.multistatus.response = new Array(responseObject.multistatus.response);
        }
        let quota: { used: number, available: number | string } | null = null;
        for (const res of responseObject.multistatus.response) {
            if (res.propstat) {
                if (res.propstat.status === "HTTP/1.1 200 OK") {
                    if (res.propstat.prop) {
                        if (res.propstat.prop["quota-used-bytes"]) {
                            if (res.propstat.prop["quota-available-bytes"]) {
                                quota = {
                                    used: res.propstat.prop["quota-used-bytes"],
                                    available: "unlimited"

                                };
                                if (res.propstat.prop["quota-available-bytes"] > 0) {
                                    quota.available = res.propstat.prop["quota-available-bytes"]
                                };
                            }
                        }
                    }
                }
            }
        }
        if (!quota) {
            debug("Error, quota not available: %s ", JSON.stringify(responseObject, null, 4));
            throw new NCError(`Error, quota not available`, "ERR_QUOTA_NOT_AVAILABLE");
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
    public async createTag(tagName: string): Promise<NCTag> {

        debug("createTag");
        let tag: NCTag | null;
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
        );

        const tagString: string | null = response.headers.get("Content-Location");
        debug("createTag new tagId %s, tagName %s", tagString, tagName);
        if (tagString === "" || tagString === null) {
            throw new NCError(`Error, tag with name '${tagName}' could not be created`, "ERR_TAG_CREATE_FAILED");
        }

        // the number id of the tag is the last element in the id (path)
        const tagId: number = this.getTagIdFromHref(tagString);

        tag = new NCTag(this, tagId, tagName, true, true, true);
        return tag;
    }

    /**
     * returns a tag identified by the name or null if not found
     * @param tagName the name of the tag
     * @returns tag or null
     */
    public async getTagByName(tagName: string): Promise<NCTag | null> {

        debug("getTag");

        const tags: NCTag[] = await this.getTags();
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
    public async getTagById(tagId: number): Promise<NCTag | null> {

        debug("getTagById");

        const tags: NCTag[] = await this.getTags();
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
            [204, 404]);

        // const responseObject: any = await this.getParseXMLFromResponse(response);
    }

    /**
     * deletes all visible assignable tags
     * @throws Error
     */
    public async deleteAllTags(): Promise<void> {

        debug("deleteAllTags");

        const tags: NCTag[] = await this.getTags();

        for (const tag of tags) {
            // debug("deleteAllTags tag: %O", tag);
            await tag.delete();
        }
    }

    /**
     * returns a list of tags
     * @returns array of tags
     */
    public async getTags(): Promise<NCTag[]> {
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

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + "/remote.php/dav/systemtags/",
            requestInit,
            [207]);

        const responseObject: any = await this.getParseXMLFromResponse(response);

        if (!responseObject.multistatus) {
            throw new NCError("Response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED");
        }

        debug("getTags: responseObject %O", responseObject);

        const tags: NCTag[] = [];
        if (responseObject.multistatus.response.href) {
            responseObject.multistatus.response = new Array(responseObject.multistatus.response);
        }
        for (const res of responseObject.multistatus.response) {
            if (res.propstat) {
                if (res.propstat.status === "HTTP/1.1 200 OK") {
                    // debug(res.href);
                    // debug(res.propstat);
                    // debug(res.propstat.prop["display-name"]);
                    // debug("prop: %O", res.propstat.prop);
                    tags.push(new NCTag(this,
                        this.getTagIdFromHref(res.href),
                        res.propstat.prop["display-name"],
                        res.propstat.prop["user-visible"],
                        res.propstat.prop["user-assignable"],
                        res.propstat.prop["can-assign"]));
                }
            }
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

        const response: Response = await this.getHttpResponse(
            `${this.nextcloudOrigin}/remote.php/dav/systemtags-relations/files/${fileId}`,
            requestInit,
            [207]);

        const responseObject: any = await this.getParseXMLFromResponse(response);

        if (!responseObject.multistatus) {
            throw new NCError("Error get tags of file: response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED");
        }

        debug("getTagsOfFile: responseObject %O", responseObject);

        const tagMap: Map<string, number> = new Map();
        if (responseObject.multistatus.response.href) {
            responseObject.multistatus.response = new Array(responseObject.multistatus.response);
        }
        for (const res of responseObject.multistatus.response) {
            if (res.propstat) {
                if (res.propstat.status === "HTTP/1.1 200 OK") {
                    tagMap.set(res.propstat.prop["display-name"], res.propstat.prop.id);
                }
            }
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
            [204, 404]);

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
            [207]);

        const responseObject: any = await this.getParseXMLFromResponse(response);
        debug("getFileId parsed response body %O", responseObject);
        if (!responseObject.multistatus) {
            throw new NCError("Response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED");
        }

        const tags: NCTag[] = [];
        if (responseObject.multistatus.response &&
            responseObject.multistatus.response.propstat &&
            responseObject.multistatus.response.propstat.status &&
            responseObject.multistatus.response.propstat.prop &&
            responseObject.multistatus.response.propstat.prop.fileid) {
            const propstat = responseObject.multistatus.response.propstat;
            if (propstat.status === "HTTP/1.1 200 OK") {
                debug("getFileId file id for %s is %s", fileUrl, propstat.prop.fileid);
                return propstat.prop.fileid;
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
            [207]);

        const responseObject: any = await this.getParseXMLFromResponse(response);
        debug("getFolderContents parsed response body %O", responseObject);
        if (!responseObject.multistatus) {
            throw new NCError("Response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED");
        }

        if (!responseObject.multistatus.response) {
            throw new NCError("Response XML multistatus response missing: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED");
        }

        const folderContents: any[] = [];

        for (const folderEntry of responseObject.multistatus.response) {
            // debug("responseObject $s", JSON.stringify(folderEntry, null, 4));

            let fileName = decodeURI(folderEntry.href.substr(folderEntry.href.indexOf("/remote.php/webdav") + 18));
            if (fileName.endsWith("/")) {
                fileName = fileName.slice(0, -1);
            }

            // debug("URL filename  = %s,", fileName);

            if ((url + "/").endsWith(folderEntry.href)) {
                continue;
            }

            for (const propstat of folderEntry.propstat) {
                if (propstat.status === "HTTP/1.1 200 OK") {
                    const folderContentsEntry: any = {};
                    folderContentsEntry.lastmod = propstat.prop.getlastmodified;
                    folderContentsEntry.fileid = propstat.prop.fileid;
                    folderContentsEntry.basename = fileName.split("/").reverse()[0];
                    folderContentsEntry.filename = fileName;
                    if (propstat.prop.getcontenttype) {
                        folderContentsEntry.mime = propstat.prop.getcontenttype;
                        folderContentsEntry.size = propstat.prop.getcontentlength;
                        folderContentsEntry.type = "file";
                    } else {
                        folderContentsEntry.type = "directory";
                    }
                    folderContents.push(folderContentsEntry);
                }
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
    public async createFolder(folderName: string): Promise<NCFolder> {
        folderName = this.sanitizeFolderName(folderName);
        debug("createFolder: folderName=%s", folderName);

        const parts1: string[] = folderName.split("/");
        for (const p of parts1) {
            if ((p) === "." || p === "..") {
                throw new NCError(`Error creating folder, folder name "${folderName}" invalid`, "ERR_CREATE_FOLDER_INVALID_FOLDER_NAME");
            }
        }

        let folder: NCFolder | null;

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
                        try {
                            debug("createFolder: folder = %s", folderPath);
                            await this.createFolderInternal(folderPath);
                        } catch (e) {
                            debug("createFolder: exception occurred calling webDAV client createDirectory %O", e.message);
                            throw e;
                        }
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
            throw new Error("createFolder: Error creating folder " + folderName);
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

        const folder: NCFolder | null = await this.getFolder(folderName);

        if (folder) {
            await this.deleteFile(folderName);
        }
    }

    /**
     * get a folder object from a path string
     * @param folderName Name of the folder like "/company/branches/germany"
     * @returns null if the folder does not exist or an folder object
     */
    public async getFolder(folderName: string): Promise<NCFolder | null> {
        folderName = this.sanitizeFolderName(folderName);
        debug("getFolder %s", folderName);

        // return root folder
        if (folderName === "/") {
            return new NCFolder(this, "/", "", "");
        }

        try {
            const stat: IStat = await this.stat(folderName);
            debug(": SUCCESS!!");
            if (stat.type !== "file") {
                return new NCFolder(this,
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
    public async getSubFolders(folderName: string): Promise<NCFolder[]> {
        debug("getSubFolders: folder %s", folderName);
        const folders: NCFolder[] = [];
        folderName = this.sanitizeFolderName(folderName);

        const folderElements: any[] = await this.Contents(folderName, true);

        for (const folderElement of folderElements) {
            debug("getSubFolders: adding subfolders %s", folderElement.filename);
            folders.push(new NCFolder(this,
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
    public async getFiles(folderName: string): Promise<NCFile[]> {
        debug("getFiles: folder %s", folderName);
        const files: NCFile[] = [];
        folderName = this.sanitizeFolderName(folderName);

        const fileElements: any[] = await this.Contents(folderName, false);

        for (const folderElement of fileElements) {
            debug("getFiles: adding file %s", folderElement.filename);
            // debug("getFiles: adding file %O", folderElement);
            files.push(new NCFile(this,
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
    public async createFile(fileName: string, data: Buffer): Promise<NCFile | null> {

        const baseName: string = path.basename(fileName);
        let folderName: string = path.dirname(fileName);
        if (folderName === ".") {
            folderName = "";
        }
        debug("createFile folder name %s base name %s", folderName, baseName);

        // ensure that we have the folder
        let folder: NCFolder | null;

        try {
            folder = await this.createFolder(folderName);
        } catch (e) {
            e.message = "Error creating file: " + e.message;
            throw e;
        }
        if (folder === null) {
            throw new NCError("File could not be created: Folder '" + folderName + "' could not be created",
                "ERR_FOLDER_NOT_FOUND",
                { folderName, baseName });
        }

        // fileName = "/d1/d2/file.txt"
        const res: Response = await this.putFileContents(fileName, data);
        // debug("%O", Object.keys(res));
        debug("createFile Status %s", res.status);

        if (!(res.status === 204 || res.status === 201)) {
            throw new NCError("File could not be created: '" + fileName + "', response status " + res.status + " " + res.statusText,
                "ERR_FILE_CREATE_FAILED",
                { folderName, baseName });
        }
        debug("createFile file successfully created");
        let file: NCFile | null;
        file = await this.getFile(fileName)
        return file;
    }

    /**
     * returns a nextcloud file object
     * @param fileName the full file name /folder1/folder2/file.pdf
     */
    public async getFile(fileName: string): Promise<NCFile | null> {
        debug("getFile fileName = %s", fileName);

        try {
            const stat: IStat = await this.stat(fileName);
            debug(": SUCCESS!!");
            if (stat.type === "file") {
                return new NCFile(this,
                    stat.filename.replace(/\\/g, "/"),
                    stat.basename,
                    stat.lastmod,
                    stat.size || 0,
                    stat.mime || "",
                    stat.fileid);
            } else {
                debug("getFolder: found object is a folder not a file");
                return null;
            }
        } catch (e) {
            debug("getFolder: exception occurred calling stat %O", e.message);
            return null;
        }
    }

    /**
     * renames the file or moves it to an other location
     * @param sourceFileName source file name
     * @param targetFileName target file name
     */
    public async moveFile(sourceFileName: string, targetFileName: string): Promise<NCFile> {

        const url: string = this.webDAVUrl + sourceFileName;
        const destinationUrl: string = this.webDAVUrl + targetFileName;

        debug("moveFile from '%s' to '%s'", url, destinationUrl);

        const requestInit: RequestInit = {
            headers: new Headers({ "Destination": destinationUrl }),
            method: "MOVE",
        };
        try {
            await this.getHttpResponse(
                url,
                requestInit,
                [201],
            );

        } catch (err) {
            debug("Error in move file %s %s source: %s destination: %s", err.message, requestInit.method, url, destinationUrl);
            throw new NCError("Error: moving file failed: source=" + sourceFileName + " target=" + targetFileName + " - " + err.message, "ERR_FILE_MOVE_FAILED");
        }

        const targetFile: NCFile | null = await this.getFile(targetFileName);
        if (!targetFile) {
            throw new NCError("Error: moving file failed: source=" + sourceFileName + " target=" + targetFileName, "ERR_FILE_MOVE_FAILED");
        }

        return targetFile;
    }

    /**
     * renames the folder or moves it to an other location
     * @param sourceFolderName source folder name
     * @param tarName target folder name
     */
    public async moveFolder(sourceFolderName: string, tarName: string): Promise<NCFolder> {

        const url: string = this.webDAVUrl + sourceFolderName;
        const destinationUrl: string = this.webDAVUrl + tarName;

        debug("moveFolder from '%s' to '%s'", url, destinationUrl);

        const requestInit: RequestInit = {
            headers: new Headers({ "Destination": destinationUrl }),
            method: "MOVE",
        };
        try {
            await this.getHttpResponse(
                url,
                requestInit,
                [201],
            );

        } catch (err) {
            debug("Error in move folder %s %s source: %s destination: %s", err.message, requestInit.method, url, destinationUrl);
            throw new NCError("Error: moving folder failed: source=" + sourceFolderName + " target=" + tarName + " - " + err.message, "ERR_FOLDER_MOVE_FAILED");
        }

        const tar: NCFolder | null = await this.getFolder(tarName);
        if (!tar) {
            throw new NCError("Error: moving folder failed: source=" + sourceFolderName + " target=" + tarName, "ERR_FOLDER_MOVE_FAILED");
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
                [200]);
        } catch (err) {
            debug("Error getContent %s - error %s", url, err.message)
            throw err;
        }

        return new Buffer(await response.arrayBuffer());
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
        const tag: NCTag | null = await this.createTag(tagName);

        if (!tag) {
            return;
        }
        if (!tag.canAssign) {
            throw new NCError(`Error: No permission to assign tag "${tagName}" to file. Tag is not assignable`, "ERR_TAG_NOT_ASSIGNABLE");
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
            [201, 409]); // created or conflict
    }

    // ***************************************************************************************
    // activity
    // ***************************************************************************************
    public async getActivities(): Promise<string[]> {
        const result: string[] = [];
        const requestInit: RequestInit = {
            headers: new Headers({ "ocs-apirequest": "true" }),
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin + "/ocs/v2.php/apps/activity/api/v2/activity/files?format=json&previews=false&since=97533",
            requestInit,
            [200]);

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

    // ***************************************************************************************
    // comments
    // ***************************************************************************************

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
            [201]); // created
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
            [207]);

        const responseObject: any = await this.getParseXMLFromResponse(response);

        if (!responseObject.multistatus) {
            throw new NCError("Response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED");
        }

        debug("getComments: responseObject %O", responseObject);

        const comments: string[] = [];
        if (responseObject.multistatus.response.href) {
            responseObject.multistatus.response = new Array(responseObject.multistatus.response);
        }
        for (const res of responseObject.multistatus.response) {
            if (res.propstat) {
                if (res.propstat.status === "HTTP/1.1 200 OK") {
                    // debug(res.href);
                    // debug(res.propstat);
                    // debug(res.propstat.prop.message);
                    comments.push(res.propstat.prop.message);
                }
            }
        }
        return comments;
    }

    // ***************************************************************************************
    // private methods
    // ***************************************************************************************

    /**
     * ckecks of the response has a body containing valid xml and returns the json representation
     * @param response the http response
     * @returns the parsed object
     * @throws NCError
     */
    private async getParseXMLFromResponse(response: Response): Promise<any> {
        const responseContentType: string | null = response.headers.get("content-type");

        if (!responseContentType) {
            throw new NCError("Response content type expected", "ERR_RESPONSE_WITHOUT_CONTENT_TYPE_HEADER");
        }

        if (responseContentType.indexOf("application/xml") === -1) {
            throw new NCError("XML response content type expected", "ERR_XML_RESPONSE_CONTENT_TYPE_EXPECTED");
        }

        const xmlBody: string = await response.text();

        if (parser.validate(xmlBody) !== true) {
            throw new NCError(`The response is not valid XML: ${xmlBody}`, "ERR_RESPONSE_NOT_INVALID_XML");
        }
        const options: any = {
            ignoreNameSpace: true,
        };
        const responseObject: any = parser.parse(xmlBody, options);
        return responseObject;
    }

    /**
     * nextcloud creates a csrf token and stores it in the html header attribute
     * data-requesttoken
     * this function is currently not used
     * @returns the csrf token / requesttoken
     */
    private async getCSRFToken(): Promise<string> {

        const requestInit: RequestInit = {
            method: "GET",
        };

        const response: Response = await this.getHttpResponse(
            this.nextcloudOrigin,
            requestInit,
            [200]);

        const html = await response.text();

        const requestToken: string = html.substr(html.indexOf("data-requesttoken=") + 19, 89);
        debug("getCSRFToken  %s", requestToken);
        return requestToken;
    }

    private async getHttpResponse(url: string, requestInit: RequestInit, expectedHttpStatusCode: number[]): Promise<Response> {

        if (!requestInit.headers) {
            requestInit.headers = new Headers();
        }

        if (requestInit.headers instanceof Headers) {
            requestInit.headers.append("Authorization", this.nextcloudAuthHeader);
            requestInit.headers.append("User-Agent", "nextcloud-node-client");
        } else {
            throw Error("getHTTPResponse: Error headers is not a Headers object");
        }

        //        const headers: { [index: string]: string } = requestInit.headers;
        // headers.Authorization = this.nextcloudAuthHeader;
        // headers["User-Agent"] = "nextcloud-node-client";

        if (this.nextcloudRequestToken === "" && requestInit.method !== "GET") {
            // this.nextcloudRequestToken = await this.getCSRFToken();
        }
        if (requestInit.method !== "GET") {
            // requestInit.headers.append("requesttoken", this.nextcloudRequestToken);
        }

        requestInit.headers.append("User-Agent", "nextcloud-node-client");

        // set the proxy
        if (this.proxy) {
            debug("proxy agent used");
            const proxyAgent = new HttpProxyAgent({
                host: this.proxy.host,
                port: this.proxy.port,
                protocol: this.proxy.protocol,
            });
            requestInit.agent = proxyAgent;
            if (this.proxy.proxyAuthorizationHeader) {
                requestInit.headers.append("Proxy-Authorization", this.proxy.proxyAuthorizationHeader);
            }
        }

        debug("getHttpResponse request header %O", requestInit.headers);
        debug("getHttpResponse url:%s, %O", url, requestInit);
        const response: Response = await fetch(url, requestInit);
        const responseContentType: string | null = response.headers.get("content-type");

        if (expectedHttpStatusCode.indexOf(response.status) === -1) {
            debug("getHttpResponse unexpected status response %s", response.status + " " + response.statusText);
            debug("getHttpResponse expected %s", expectedHttpStatusCode.join(","));
            debug("getHttpResponse headers %O", response.headers);
            debug("getHttpResponse request body %s", requestInit.body);
            debug("getHttpResponse text %s", await response.text());
            throw new Error(`HTTP response status ${response.status} not expected. Expected status: ${expectedHttpStatusCode.join(",")} - status text: ${response.statusText}`);
        }
        if (!responseContentType) {
            throw new Error("Content type missing in response");
        }

        return response;
    }

    /**
     * get contents array of a folder
     * @param folderName Name of the folder like "/company/branches/germany"
     * @param folderIndicator true if folders are requested otherwise files
     * @returns array of folder contents meta data
     */
    private async Contents(folderName: string, folderIndicator: boolean): Promise<any[]> {
        debug("Contents: folder %s", folderName);
        const folders: NCFolder[] = [];
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
            await this.getFolderContents(folderName);

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
            headers: new Headers({ "Depth": "0" }),
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
            method: "PROPFIND",
        };
        let response: Response;
        try {
            response = await this.getHttpResponse(
                url,
                requestInit,
                [207],
            );

        } catch (err) {
            debug("Error in stat %s %s %s %s", err.message, requestInit.method, url);
            throw err;
        }

        const responseObject: any = await this.getParseXMLFromResponse(response);

        if (!responseObject.multistatus) {
            debug("Response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4));
            throw new NCError("Response XML is not a multistatus response: " + JSON.stringify(responseObject, null, 4),
                "ERR_MULISTATUS_EXPECTED_IN_STAT");
        }

        if (!responseObject.multistatus.response) {
            debug("Response XML has no response: " + JSON.stringify(responseObject.multistatus, null, 4));
            throw new NCError("Response XML has no response: " + JSON.stringify(responseObject.multistatus, null, 4),
                "ERR_MULISTATUS_RESPONSE_EXPECTED_IN_STAT");
        }

        if (!responseObject.multistatus.response.propstat) {
            debug("Response XML has no propertystatus: " + JSON.stringify(responseObject.multistatus.response, null, 4));
            throw new NCError("Response XML has no propertystatus: " + JSON.stringify(responseObject.multistatus, null, 4),
                "ERR_MULISTATUS_RESPONSE_STATUS_EXPECTED_IN_STAT");
        }

        let propStats = responseObject.multistatus.response.propstat;
        if (!isArray(propStats)) {
            propStats = Array(responseObject.multistatus.response.propstat);
        }

        let resultStat: IStat | null = null;
        for (const propStat of propStats) {
            if (propStat.status === "HTTP/1.1 200 OK") {
                // debug(propStat);                
                resultStat = {
                    type: "file",
                    fileid: propStat.prop["fileid"],
                    basename: basename(fileName),
                    filename: fileName,
                    lastmod: propStat.prop["getlastmodified"],
                }
                if (propStat.prop["getcontentlength"]) {
                    resultStat.size = propStat.prop["getcontentlength"];
                } else {
                    resultStat.type = "directory";
                }
                if (propStat.prop["getcontenttype"]) {
                    resultStat.mime = propStat.prop["getcontenttype"];
                }
            }
        }

        if (!resultStat) {
            debug("Error: response %s", JSON.stringify(responseObject, null, 4));
            throw new NCError("Error getting status information from : " + url,
                "ERR_STAT");
        }
        return resultStat;
    }

    private async putFileContents(fileName: string, data: Buffer): Promise<Response> {

        const url: string = this.webDAVUrl + fileName;
        debug("putFileContents %s", url);

        const requestInit: RequestInit = {
            body: data,
            method: "PUT",
        };
        let response: Response;
        try {
            response = await this.getHttpResponse(
                url,
                requestInit,
                [201, 204],
            );

        } catch (err) {
            debug("Error in stat %s %s %s %s", err.message, requestInit.method, url);
            throw err;
        }
        return response;
    }

}
