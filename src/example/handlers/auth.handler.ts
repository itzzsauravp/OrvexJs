import { YaloRequest, YaloResponse } from "../../core";

export function loginHandler(_req: YaloRequest, res: YaloResponse) {
  return res.relay({ success: true, message: "successfully loggedin" });
}
