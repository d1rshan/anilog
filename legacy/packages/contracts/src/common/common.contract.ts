import { t } from "elysia";

export const UserParams = t.Object({ id: t.String() });
export const UsernameParams = t.Object({ username: t.String() });
export const SuccessCountDto = t.Object({ success: t.Boolean(), count: t.Integer() });

export type UserParams = (typeof UserParams)["static"];
export type UsernameParams = (typeof UsernameParams)["static"];
export type SuccessCountDto = (typeof SuccessCountDto)["static"];
