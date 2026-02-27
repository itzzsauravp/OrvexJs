import { quickHash } from "../helpers/general.helper";
import { Orvex } from ".";

export class OrvexBranch extends Orvex {
  constructor() {
    super({ isRoot: false });
  }

  /**
   *
   * @param url A prefix for the nested route handlers.
   * @param orvexInstance Instance of the main Orvex app.
   */
  public prefixUrlWith(url: string, orvexInstance: Orvex) {
    const staticRoutes = this.getStaticRoutes();

    const updatedStatic = new Map(
      [...staticRoutes].map(([_key, value]) => {
        const newUrl = `${url}${value.url}`;
        value.url = newUrl;
        const routeHash = quickHash(`${value.method}-${newUrl}`);
        return [routeHash, value];
      }),
    );

    const updatedDyamic = this.getDynamicRoutes().map((route) => ({
      ...route,
      segments: [...url.split("/").filter(Boolean), ...route.segments],
      definition: { ...route.definition, url: `${url}${route.definition.url}` },
    }));

    orvexInstance.mergeWithGlobalRoute(updatedStatic, updatedDyamic);
  }
}
