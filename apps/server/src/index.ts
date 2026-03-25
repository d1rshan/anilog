import { app } from "./app";
import { serverEnv } from "@anilog/env/server";

const port = serverEnv.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export type { App } from "./app";
