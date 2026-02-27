import { Orvex } from "./core";
import { HTTP } from "./core/@orvex_enums";

const orvex = Orvex.create();

orvex.register(HTTP.GET, "/", (req, res) => {
  res.ok("Hello world");
});

orvex.listen(8000);
