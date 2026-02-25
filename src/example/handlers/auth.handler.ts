import { YaloRequest, YaloResponse } from "../../core";

export function loginHandler(req: YaloRequest, res: YaloResponse) {
  return res.json({ success: true, message: "successfully loggedin" });
}
