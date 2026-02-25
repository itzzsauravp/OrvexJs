import { Branch, Yalo, YaloRequest, YaloResponse } from "./src/core";
import { HTTP } from "./src/core/@yalo_common";

async function bootstrap() {
    const app = await Yalo.create()

    const branch = new Branch();
    branch.register(HTTP.GET, "/page", (req: YaloRequest, res: YaloResponse) => {
        return res.send("This is a nested router");
    });

    app.register(HTTP.GET, "/", (req: YaloRequest, res: YaloResponse) => {
        return res.send("hello world, this is test route");
    });
    app.plug("/home", branch);

    app.listen(8000, undefined, () => {
        console.log("Hello world server running @ http://localhost:8000/");
    });
}

bootstrap();
