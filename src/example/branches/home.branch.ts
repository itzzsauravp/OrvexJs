import { HTTP } from "../../enums/yalo.enums";
import { Branch } from "../../core";
import { greetLogger } from "../middlewares/mock.middleware";
import { getHomeInfoHandler } from "../handlers/home.handler";

const homeBranch = new Branch();
homeBranch.wire([greetLogger]);

homeBranch.register(HTTP.GET, "/info", getHomeInfoHandler);

export default homeBranch;
