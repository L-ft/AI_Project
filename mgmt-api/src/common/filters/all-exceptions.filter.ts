import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message = exceptionResponse.message || exceptionResponse;
    const code = exceptionResponse.code || 'INTERNAL_ERROR';

    response.status(status).json({
      status: status,
      code: code,
      message: Array.isArray(message) ? message[0] : message,
      details: Array.isArray(message) ? message : null,
      traceId: request.headers['x-request-id'] || null,
    });
  }
}
