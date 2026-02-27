import { OrvexRequest, OrvexResponse } from "../../core";

export function loginHandler(_req: OrvexRequest, res: OrvexResponse) {
  return res.relay({ success: true, message: "successfully loggedin" });
}
