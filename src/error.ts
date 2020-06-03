// tslint:disable:max-classes-per-file
// tslint:disable-next-line:no-var-requires
const debug = require("debug").debug("ClientError");

export default class ClientError extends Error {
    public code: string;
    private context?: any;

    constructor(m: string, code: string, context?: any) {
        super(m);
        this.code = code;
        this.context = context;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class BaseError extends Error {
    private context?: any;

    constructor(m: string, context?: any) {
        super(m);
        this.context = context;
    }
}


/**
 * the query limit parameter must be a number larger than 0
 */
export class QueryLimitError extends BaseError { };

/**
 * the query offset parameter must be a number larger than 0
 */
export class QueryOffsetError extends BaseError { };

/**
 * user group already exists
 */
export class UserGroupAlreadyExistsError extends BaseError { };

/**
 * user group does not exist
 */
export class UserGroupDoesNotExistError extends BaseError { };

/**
 * user group cloud not be deleted
 */
export class UserGroupDeletionFailedError extends BaseError { };
