import { HttpException, HttpStatus } from "@nestjs/common";

export const apiError = (status: HttpStatus, code: string, message: string) => new HttpException({ error: { code, message } }, status);

export const validationError = () => apiError(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Некорректный запрос");

export const notFound = () => apiError(HttpStatus.NOT_FOUND, "NOT_FOUND", "Не найдено");

export const unauthenticated = () => apiError(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Требуется вход администратора");

export const invalidCredentials = () => apiError(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Неверный email или пароль");

export const slotUnavailable = () => apiError(HttpStatus.CONFLICT, "SLOT_UNAVAILABLE", "Слот недоступен");
