import { Region } from "../models/endpoints/Region";
import { EndpointConfig } from "../models/endpoints/EndpointConfig";
import { Endpoints } from "../models/endpoints/Endpoints";
import { Environment } from "../models/endpoints/Environment";

/**
 * Provides methods for getting various endpoints.
 *
 * @internal
 */
export class EndpointsFactory {
  private static getDomain(endpointConfig: EndpointConfig): string {
    const { region = Region.US, env = Environment.PROD } = endpointConfig;
    switch (region) {
      case Region.US:
        return env === Environment.PROD
          ? "liveapi.yext.com"
          : `liveapi-${env}.yext.com`;
      case Region.EU:
        if (env === Environment.PROD) {
          return "cdn.eu.yextapis.com";
        }
        throw new Error(
          `Unsupported domain: invalid environment "${env}" for region EU`
        );
      default:
        throw new Error(`Unsupported domain: unknown region "${region}"`);
    }
  }

  public static getEndpoints(endpointConfig: EndpointConfig): Endpoints {
    const { businessId, botId } = endpointConfig;
    const domain = this.getDomain(endpointConfig);
    return {
      chat: `https://${domain}/v2/accounts/${
        businessId || "me"
      }/chat/${botId}/message`,
      chatStream: `https://${domain}/v2/accounts/${
        businessId || "me"
      }/chat/${botId}/message/streaming`,
    };
  }
}
