import { defaultApiVersion } from "./constants";
import { HttpService } from "./http/HttpService";
import { EndpointsFactory } from "./infra/EndpointsFactory";
import { StreamResponse } from "./infra/StreamResponse";
import { ChatConfig, MessageRequest, MessageResponse } from "./models";
import { Endpoints } from "./models/endpoints/Endpoints";
import { ApiMessageRequest } from "./models/endpoints/MessageRequest";
import { ApiResponse } from "./models/http/ApiResponse";
import { QueryParams } from "./models/http/params";
import { ApiResponseValidator } from "./validation/ApiResponseValidator";
import { RawResponse } from "./models";

interface Poster {
  post<K extends Record<string, any>>(
    url: string,
    queryParams: QueryParams,
    body: K,
    apiKey: string
  ): Promise<RawResponse>;
}

/**
 * The entrypoint to the chat-core library. Provides methods for interacting with Chat API.
 *
 * @public
 */
export class ChatCore {
  private chatConfig: ChatConfig;
  private httpService: Poster;
  private endpoints: Endpoints;
  private nightly: boolean;

  constructor(chatConfig: ChatConfig, nightly?: boolean) {
    this.chatConfig = chatConfig;
    this.httpService = new HttpService();
    this.endpoints =
      chatConfig.endpoints ?? EndpointsFactory.getEndpoints(this.chatConfig);
    this.nightly = nightly ?? false;
  }

  /**
   * Make a request to Chat API to generate the next message.
   *
   * @remarks
   * If rejected, an Error is returned.
   *
   * @param request - request to get next message
   */
  async getNextMessage(request: MessageRequest): Promise<MessageResponse> {
    const queryParams: QueryParams = { v: defaultApiVersion };
    const body: ApiMessageRequest = {
      ...request,
      version: this.chatConfig.version,
      promptPackage: this.nightly ? "nightly" : undefined,
    };
    const rawResponse = await this.httpService.post(
      this.endpoints.chat,
      queryParams,
      body,
      this.chatConfig.apiKey
    );
    const jsonResponse: ApiResponse = await rawResponse.json();
    if (!rawResponse.ok) {
      const validationResult = ApiResponseValidator.validate(jsonResponse);
      return validationResult instanceof Error
        ? Promise.reject(validationResult)
        : Promise.reject(
            "An error occurred while processing request to Chat API."
          );
    }
    return this.createMessageResponse(jsonResponse);
  }

  private createMessageResponse(data: any): MessageResponse {
    //CLIP-303: type check data
    return {
      conversationId: data.response.conversationId,
      message: data.response.message,
      notes: data.response.notes,
    };
  }

  /**
   * Make a request to Chat streaming API to generate the next message
   * and consume its tokens via server-sent events.
   *
   * @experimental
   *
   * @remarks
   * If rejected, an Error is returned.
   *
   * @param request - request to get next message
   */
  async streamNextMessage(request: MessageRequest): Promise<StreamResponse> {
    const queryParams: QueryParams = { v: defaultApiVersion };
    const body: ApiMessageRequest = {
      ...request,
      version: this.chatConfig.version,
    };
    const rawResponse = await this.httpService.post(
      this.endpoints.chatStream,
      queryParams,
      body,
      this.chatConfig.apiKey
    );
    return new StreamResponse(rawResponse);
  }
}
