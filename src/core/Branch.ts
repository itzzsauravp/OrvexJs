import { quickHash } from "../helpers/hashGenerator";
import { Yalo } from ".";

export class Branch extends Yalo {
  constructor() {
    super();
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
        const newUrl = `${url}${value.url}`; // need a method here
        value.url = newUrl;
        const routeHash = quickHash(`${value.method}-${newUrl}`);
        return [routeHash, value];
      }),
    );
    yaloInstance.mergeWithGlobalRoute(updatedRoutesWithPrefix);
  }
}
