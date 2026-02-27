import { HTTP } from "../../core/@orvex_enums";
import { OrvexBranch } from "../../core";
import { greetLogger } from "../middlewares/mock.middleware";
import { getHomeInfoHandler } from "../handlers/home.handler";

const homeBranch = new OrvexBranch();
homeBranch.wire([greetLogger]);

homeBranch.register(HTTP.GET, "/$id", getHomeInfoHandler);

export default homeBranch;
