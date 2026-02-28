import { Orvex } from "./core";
import { HTTP } from "./core/@orvex_enums";

const orvex = Orvex.create();

orvex.register(HTTP.GET, "/", (req, res) => {
  res.ok("Hello world");
});

orvex.register(HTTP.POST, "/file", (req, res) => {
  console.log(req.files);
  console.log(req.body);
  res.ok({ file: "received" });
});

orvex.listen(8000);
