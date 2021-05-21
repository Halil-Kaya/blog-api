import { ErrorType } from "../enums/error-type.enum";

export class BaseError extends Error {
    constructor(
        public status:number        = 400,
        public message: ErrorType   = ErrorType.UNEXPECTED,
        public innerException:Error = null
    ){
        super();
        Error.apply(this,arguments);
    }
}