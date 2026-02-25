import { quickHash } from "../helpers/general.helper";
import { Yalo } from ".";

export class Branch extends Yalo {
  constructor() {
    super({ isRoot: false });
  }

  /**
   *
   * @param url A prefix for the nested route handlers.
   * @param yaloInstance Instance of the main Yalo app.
   */
  public prefixUrlWith(url: string, yaloInstance: Yalo) {
    const routes = this.getRoutes();

    const updatedRoutesWithPrefix = new Map(
      [...routes].map(([_key, value]) => {
        const newUrl = `${url}${value.url}`;
        value.url = newUrl;
        const routeHash = quickHash(`${value.method}-${newUrl}`);
        return [routeHash, value];
      }),
    );
    yaloInstance.mergeWithGlobalRoute(updatedRoutesWithPrefix);
  }
}
