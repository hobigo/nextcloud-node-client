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

/**
 * user not found
 */
export class UserNotFoundError extends BaseError { };

/**
 * user already exists
 */
export class UserAlreadyExistsError extends BaseError { };

/**
 * error creating user
 */
export class UserCreateError extends BaseError { };

/**
 * error updating user
 */
export class UserUpdateError extends BaseError { };

/**
 * Error sending user welcome email
 */
export class UserResendWelcomeEmailError extends BaseError { };

/**
 * the service response is invalid
 */
export class InvalidServiceResponseFormatError extends BaseError { };

/**
 * the service response is invalid
 */
export class InsufficientPrivilegesError extends BaseError { };

/**
 * operation failed
 */
export class OperationFailedError extends BaseError { };

/**
 * the command is already executed
 */
export class CommandAlreadyExecutedError extends BaseError { };