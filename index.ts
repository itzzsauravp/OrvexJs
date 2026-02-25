import { Branch, Yalo, YaloRequest, YaloResponse } from "./src/core";
import { HTTP } from "./src/core/@yalo_common";

async function bootstrap() {
  const app = await Yalo.create();
  const authBranch = new Branch();

  app.gwire([
    (_req: YaloRequest, _res: YaloResponse) => {
      console.log("Root middleware");
    },
  ]);

  app.register(HTTP.GET, "/", (_req: YaloRequest, res: YaloResponse) => {
    return res.send("hello world, this is test route");
  });

  authBranch
    .wire([
      (_req: YaloRequest, _res: YaloResponse) => {
        console.log("First middleware");
      },
    ])
    .register(
      HTTP.GET,
      "/user",
      (_req: YaloRequest, res: YaloResponse) => {
        return res.send("This authBranch deals with user auth.");
      },
      [
        (_req: YaloRequest, _res: YaloResponse) => {
          console.log("Second middelware");
        },
      ],
    );

  app.mount("/auth", authBranch);

  app.listen(8000, undefined, () => {
    console.log("Hello world server running @ http://localhost:8000/");
  });
}

bootstrap();
