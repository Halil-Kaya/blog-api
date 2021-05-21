import { ErrorType } from "../enums/error-type.enum";
import { BaseError } from "../errors/base.error";

export function checkResult<T>(data:T,status : number,message:ErrorType){
    if(!data){
        throw new BaseError(status,message)
    }
}