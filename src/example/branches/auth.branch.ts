import { HTTP } from "../../core/@orvex_enums";
import { OrvexBranch } from "../../core";
import { loginHandler } from "../handlers/auth.handler";
import { authLogger } from "../middlewares/mock.middleware";

const authBranch = new OrvexBranch();
authBranch.wire([authLogger]);

authBranch.register(HTTP.POST, "/login", loginHandler);

export default authBranch;
