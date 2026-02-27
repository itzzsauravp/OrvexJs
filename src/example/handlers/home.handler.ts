import { OrvexRequest, OrvexResponse } from "../../core";

export function getHomeInfoHandler(req: OrvexRequest, res: OrvexResponse) {
  return res.relay({ success: true, message: `Getting home info for: ${req.params.id}` });
}
