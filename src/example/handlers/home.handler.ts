import { YaloRequest, YaloResponse } from "../../core";

export function getHomeInfoHandler(_req: YaloRequest, res: YaloResponse) {
  return res.relay({ success: true, message: "home page loaded successfully" });
}
