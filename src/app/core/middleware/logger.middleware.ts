import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction,Request,Response } from "express";
import { LogHelper } from "../helpers/logger.helper";



@Injectable()
export class LoggerMiddleware implements NestMiddleware{

    private logHelper = new LogHelper()

    private logger = new Logger('HTTP');

    use(request:Request,response:Response,next:NextFunction) : void {

        //requestten bilgileri aliyorum
        const {ip,method,originalUrl} = request;
        const userAgent = request.get('user-agent') || '';


        response.on('finish', () => { 

            const { statusCode } = response;
            const contentLength = response.get('content-length');

            if(/\b(?:4[0-9]{2}|5[0-9][0-9]|599)\b/.test(statusCode.toString())) {

                //dosyaya logu yaziyorum
                this.logHelper.logError(`🚨️[${ method }|${ statusCode }] | ${ originalUrl } | ${ contentLength }bytes | ${ userAgent } | ip: ${ ip }`)

                this.logger.error(
                    `🚨️[${ method }|${ statusCode }] | ${ originalUrl } | ${ contentLength }bytes | ${ userAgent } | ip: ${ ip }`
                );
            } else {
                
                //dosyaya logu yaziyorum
                this.logHelper.logInfo(`[${ method }|${ statusCode }] | ${ originalUrl } | ${ contentLength }bytes | ${ userAgent }`)

                this.logger.log(
                    `[${ method }|${ statusCode }] | ${ originalUrl } | ${ contentLength }bytes | ${ userAgent }`
                );
            }
        });

        next()
    }

}