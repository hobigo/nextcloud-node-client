
export default class FileSizeFormatter {
    private bytes: number;
    private oneKiloByte = 1024;
    private oneMegaByte = this.oneKiloByte * 1024;
    private oneGigaByte = this.oneMegaByte * 1024;

    constructor(bytes: number) {
        this.bytes = bytes;
    }
    public getUserFriendlyFileSize(): string {
        let suffix: string;
        let size = this.bytes;
        if (size > this.oneGigaByte) {
            size /= this.oneGigaByte;
            suffix = " GB";
        }
        else if (this.bytes > this.oneMegaByte) {
            size /= this.oneMegaByte;
            suffix = " MB";
        }
        else if (this.bytes > this.oneKiloByte) {
            size /= this.oneKiloByte;
            suffix = " kB";
        }
        else {
            suffix = " B";
        }
        size = Math.round(size);
        return size + suffix;
    }

}
