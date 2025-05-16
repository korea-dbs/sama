import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class CustomExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: Error, host: ArgumentsHost): void;
}
