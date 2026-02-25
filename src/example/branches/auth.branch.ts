import { Branch } from "../../core";
import { HTTP } from "../../types/yalo.types";
import { loginHandler } from "../handlers/auth.handler";
import { authLogger } from "../middlewares/mock.middleware";

const authBranch = new Branch();
authBranch.wire([authLogger]);

authBranch.register(HTTP.POST, "/login", loginHandler);

export default authBranch;
