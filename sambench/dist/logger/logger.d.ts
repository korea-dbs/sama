import { LoggerService } from '@nestjs/common';
export declare class MyLogger implements LoggerService {
    debug(message: any, context?: string, ...optionalParams: any[]): void;
    error(message: any, trace?: string, context?: string, ...optionalParams: any[]): void;
    log(message: any, context?: string, ...optionalParams: any[]): void;
    warn(message: any, context?: string, ...optionalParams: any[]): void;
    verbose(message: any, context?: string, ...optionalParams: any[]): void;
}
