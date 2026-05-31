import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === "object" && payload !== null && "error" in payload) {
        return response.status(status).json(payload);
      }

      return response.status(status).json({ error: { code: status === 404 ? "NOT_FOUND" : "HTTP_ERROR", message: exception.message } });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Непредвиденная ошибка" } });
  }
}
