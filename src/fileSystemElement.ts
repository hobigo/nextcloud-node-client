import Client, { ClientError } from "./client";

/**
 * The file class represents a file in nextcloud.
 * It exposes file properties and content handling, commenting and tagging
 */
export default abstract class FileSystemElement {

    /**
     * The name of the file system element including the path
     * The name is readonly
     */
    abstract get name(): string;

    /**
     * The base name of the file system element (name without path)
     * The base name is readonly
     */
    abstract get baseName(): string;

    /**
     * The timestamp of the last file system element change
     * readonly
     */
    abstract get lastmod(): Date;

    /**
     * The unique id of the file system element.
     */
    abstract get id(): number;

    /**
     * deletes a file system element
     * @throws Error
     */
    public abstract async delete(): Promise<void>;

    /**
     * moves or renames the current file system element to the new location
     * target folder must exists
     * @param targetFileName the name of the target file /f1/f2/myfile.txt
     * @throws Error
     */
    public abstract async move(targetName: string): Promise<FileSystemElement>;

    /**
     * @returns the url of the file sytsem element
     * @throws Error
     */
    public abstract getUrl(): string;

    /**
     * @returns the url of the file system element in the UI
     * @throws Error
     */
    public abstract getUIUrl(): string;

    /**
     * adds a tag name to the file system element
     * @param tagName name of the tag
     */
    public abstract async addTag(tagName: string): Promise<void>;

    /**
     * get tag names
     * @returns array of tag names
     */
    public abstract async getTags(): Promise<string[]>;

    /**
     * removes a tag of the file system element
     * @param tagName the name of the tag
     */
    public abstract async removeTag(tagName: string): Promise<void>;

    /**
     * add comment to file
     * @param comment the comment
     */
    public abstract async addComment(comment: string): Promise<void>;

    /**
     * get list of comments of file
     * @param top number of comments to return
     * @param skip the offset
     * @returns array of comment strings
     * @throws Exception
     */
    public abstract async getComments(top?: number, skip?: number): Promise<string[]>;
}
