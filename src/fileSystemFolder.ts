// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("FileSystemFolder");

import util from "util";
import fs from "fs";
import path from "path";

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

export interface IFileNameFormats {
    absolute: string;
    relative: string;
}

export default class FileSystemFolder {
    private name: string;
    constructor(name: string) {
        this.name = name;
    }

    public getName(): IFileNameFormats {
        return { relative: this.name, absolute: path.resolve(this.name) };
    }

    public async getFileNames(): Promise<IFileNameFormats[]> {
        const fileNames: IFileNameFormats[] = [];

        for (const absoluteFileName of await this.getFileNamesRecursively(this.name)) {
            fileNames.push({ absolute: absoluteFileName, relative: absoluteFileName.replace(path.resolve(this.getName().absolute), "").replace(/\\/g, "/") })
        }
        return (fileNames);
    };

    private async getFileNamesRecursively(name: string): Promise<string[]> {

        const subdirs: string[] = await readdir(name);
        const files = await Promise.all(subdirs.map(async (subdir: string) => {
            const res: string = path.resolve(name, subdir);
            return (await stat(res)).isDirectory() ? this.getFileNamesRecursively(res) : res;
        }));
        return files.reduce((a: any, f: any) => a.concat(f), []);
    }


}
