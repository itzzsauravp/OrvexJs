import { YaloRequest, YaloResponse } from "../../core";

export function getHomeInfoHandler(req: YaloRequest, res: YaloResponse) {
  return res.relay({ success: true, message: `Getting home info for: ${req.params.id}` });
}
