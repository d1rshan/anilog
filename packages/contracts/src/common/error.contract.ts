import { t } from "elysia";

export const ErrorCode = t.Union([
  t.Literal("UNAUTHORIZED"),
  t.Literal("FORBIDDEN"),
  t.Literal("NOT_FOUND"),
  t.Literal("CONFLICT"),
  t.Literal("VALIDATION"),
  t.Literal("EXTERNAL"),
  t.Literal("INTERNAL"),
]);

export const ErrorDto = t.Object({
  code: ErrorCode,
  message: t.String(),
});

export const ErrorResponse = t.Object({
  error: ErrorDto,
});

export type ErrorCode = (typeof ErrorCode)["static"];
export type ErrorDto = (typeof ErrorDto)["static"];
export type ErrorResponse = (typeof ErrorResponse)["static"];
