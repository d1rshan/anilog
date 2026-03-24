import { Elysia } from "elysia";
import { isApiError, toErrorResponse } from "../lib/api-error";

export const errorPlugin = new Elysia({ name: "error.plugin" }).onError(({ code, error, set }) => {
  if (isApiError(error)) {
    set.status = error.status;
    return toErrorResponse(error);
  }

  if (code === "VALIDATION") {
    set.status = 400;
    return {
      error: {
        code: "VALIDATION",
        message: "Invalid request payload",
      },
    };
  }

  if (code === "NOT_FOUND") {
    set.status = 404;
    return {
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    };
  }

  console.error("Unhandled server error:", error);
  set.status = 500;
  return {
    error: {
      code: "INTERNAL",
      message: "Internal server error",
    },
  };
});
