import { defaultApiDomain, defaultApiVersion } from "./constants";
import { HttpService } from "./http/HttpService";
import { StreamResponse } from "./infra/StreamResponse";
import { ChatConfig, MessageRequest, MessageResponse } from "./models";
import { ApiMessageRequest } from "./models/endpoints/MessageRequest";
import { ApiResponse } from "./models/http/ApiResponse";
import { QueryParams } from "./models/http/params";
import { ApiResponseValidator } from "./validation/ApiResponseValidator";

/**
 * The entrypoint to the chat-core library. Provides methods for interacting with Chat API.
 *
 * @public
 */
export class ChatCore {
  private chatConfig: ChatConfig;

  private httpService: HttpService;
  private apiResponseValidator: ApiResponseValidator;

  constructor(chatConfig: ChatConfig) {
    this.chatConfig = chatConfig;
    this.httpService = new HttpService();
    this.apiResponseValidator = new ApiResponseValidator();
  }

  private getUrl({ businessId, botId, apiDomain }: ChatConfig) {
    return `https://${apiDomain || defaultApiDomain}/v2/accounts/${
      businessId ?? "me"
    }/chat/${botId}/message`;
  }

  private getStreamUrl({ businessId, botId, apiDomain }: ChatConfig) {
    return `https://${apiDomain || defaultApiDomain}/v2/accounts/${
      businessId ?? "me"
    }/chat/${botId}/message/streaming`;
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
    };
    const rawResponse = await this.httpService.post(
      this.getUrl(this.chatConfig),
      queryParams,
      body,
      this.chatConfig.apiKey
    );
    const jsonResponse: ApiResponse = await rawResponse.json();
    const validationResult = this.apiResponseValidator.validate(jsonResponse);
    if (validationResult instanceof Error) {
      return Promise.reject(validationResult);
    }
    return this.createMessageResponse(jsonResponse);
  }

  private createMessageResponse(data: any): MessageResponse {
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
      this.getStreamUrl(this.chatConfig),
      queryParams,
      body,
      this.chatConfig.apiKey
    );
    return new StreamResponse(rawResponse);
  }
}
