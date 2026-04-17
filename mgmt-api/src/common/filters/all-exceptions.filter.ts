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

    const path = (request.url || '').split('?')[0];
    if (path.startsWith('/v1/data-builder') && exception instanceof HttpException) {
      if (typeof exceptionResponse === 'string') {
        response.status(status).json({ detail: exceptionResponse });
        return;
      }
      response.status(status).json(exceptionResponse);
      return;
    }

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
