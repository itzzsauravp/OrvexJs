import { quickHash } from "../helpers/general.helper";
import { Orvex } from ".";

/**
 * OrvexBranch represents a modular routing unit
 * that groups related routes and enables nested routing.
 */
export class OrvexBranch extends Orvex {
  constructor() {
    super({ isRoot: false });
  }

  /**
   * @internal
   * This prepares the branch's routes to be swallowed by the root app.
   */
  public getProcessedRoutes(prefix: string) {
    const staticRoutes = this.getStaticRoutes();

    const updatedStatic = new Map(
      [...staticRoutes].map(([_key, value]) => {
        const newUrl = `${prefix}${value.url}`;
        // We create a new object to avoid mutating the original branch definition
        const updatedValue = {
          ...value,
          url: newUrl,
          // Combine branch-wide middlewares with the specific route middlewares
          middlewares: [...this.getBranchMiddlewares(), ...value.middlewares],
        };
        const routeHash = quickHash(`${value.method}-${newUrl}`);
        return [routeHash, updatedValue];
      }),
    );

    const updatedDynamic = this.getDynamicRoutes().map((route) => ({
      ...route,
      segments: [...prefix.split("/").filter(Boolean), ...route.segments],
      definition: {
        ...route.definition,
        url: `${prefix}${route.definition.url}`,
        middlewares: [...this.getBranchMiddlewares(), ...route.definition.middlewares],
      },
    }));

    return { updatedStatic, updatedDynamic };
  }
}
