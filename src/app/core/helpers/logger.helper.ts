import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as log4js from 'log4js'
import { IEntvironment } from "src/app/interfaces/environment.interface";

@Injectable()
export class LogHelper {

    constructor(){
        log4js.configure({
            appenders: { cheese: { type: "file", filename: "./src/log/log-history.log" } },
            categories: { default: { appenders: ["cheese"], level: "trace" } }
        })
    }

    public logInfo(logMessage :string){
        log4js.getLogger("LOG").info(logMessage);
    }

    public logError(logMessage : string){
        log4js.getLogger("LOG").error(logMessage);
        
    }

    public logTrace(logMessage:string){
        log4js.getLogger("LOG").trace(logMessage);
    }


}