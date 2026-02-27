import { HTTP } from "../core/@yalo_enums";
import { Yalo, YaloResponse } from "../core";
import authBranch from "./branches/auth.branch";
import { greetLogger, healthLogger, requestLogger } from "./middlewares/mock.middleware";
import homeBranch from "./branches/home.branch";

export const app = Yalo.create();

app.wire([requestLogger]);
app.mount("/auth", authBranch);
app.mount("/home", homeBranch);

app.register(
  HTTP.GET,
  "/health",
  function healthCheckup(_, res: YaloResponse) {
    return res
      .setHeaders({ Connection: "Keep-Alive", "Content-Type": "text/html" })
      .ok(`<h1>hello world ${new Date()}</h1>`);
  },
  [healthLogger, greetLogger],
);
