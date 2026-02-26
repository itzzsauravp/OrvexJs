import { HTTP, YaloStatus } from "../enums/yalo.enums";
import { Yalo, YaloResponse } from "../core";
import authBranch from "./branches/auth.branch";
import { greetLogger, healthLogger, requestLogger } from "./middlewares/mock.middleware";
import homeBranch from "./branches/home.branch";

export async function bootstrap() {
  const app = await Yalo.create();
  app.wire([requestLogger]);

  app.register(
    HTTP.GET,
    "/health",
    function healthCheckup(_, res: YaloResponse) {
      return res
        .code(YaloStatus.OK)
        .setHeaders({ Connection: "Keep-Alive", "Content-Type": "text/html" })
        .relay("<h1>hello world</h1>");
    },
    [healthLogger, greetLogger],
  );

  app.mount("/auth", authBranch);
  app.mount("/home", homeBranch);

  return app;
}
