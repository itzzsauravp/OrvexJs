import { Yalo, YaloRequest, YaloResponse } from "./src/core";
import { HTTP } from "./src/core/@yalo_common"

async function bootstrap() {
    const app = await Yalo.create();

    app.register(HTTP.GET, "/", (req: YaloRequest, res: YaloResponse) => {
        return res.send("hello world, this is test route");
    });

    app.listen(8000, undefined, () => {
        console.log("Hello world server running @ http://localhost:8000/");
    });
}

bootstrap();
