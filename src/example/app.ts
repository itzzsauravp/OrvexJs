import { Yalo, YaloResponse } from "../core";
import { HTTP } from "../types/yalo.types";
import authBranch from "./branches/auth.branch";
import { healthLogger, requestLogger } from "./middlewares/mock.middleware";

export async function bootstrap() {
  const app = await Yalo.create();
  app.wire([requestLogger]);

  app.register(
    HTTP.GET,
    "/health",
    function healthCheckup(_, res: YaloResponse) {
      return res.json({ status: "server is running fine" });
    },
    [healthLogger],
  );

  app.mount("/auth", authBranch);

  return app;
}
