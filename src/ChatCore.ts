import { defaultApiDomain, defaultApiVersion } from "./constants";
import { HttpService } from "./http/HttpService";
import { ChatConfig, MessageRequest, MessageResponse } from "./models";
import { ApiMessageRequest } from "./models/endpoints/MessageRequest";
import { QueryParams } from "./models/http/params";
import { ApiResponseValidator } from "./validation/ApiResponseValidator";

/**
 * The entrypoint to the chat-core library. Provides methods for interacting with Chat API.
 *
 * @public
 */
export class ChatCore {
  private chatConfig: ChatConfig;
  private url: string;

  private httpService: HttpService;
  private apiResponseValidator: ApiResponseValidator;

  constructor(chatConfig: ChatConfig) {
    this.chatConfig = chatConfig;
    this.url = this.getUrl(chatConfig);
    this.httpService = new HttpService();
    this.apiResponseValidator = new ApiResponseValidator();
  }

  private getUrl({ businessId, botId, apiDomain }: ChatConfig) {
    return `https://${apiDomain || defaultApiDomain}/v2/accounts/${
      businessId ?? "me"
    }/chat/${botId}/message`;
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
      version: this.chatConfig.version,
      messages: request.messages,
      notes: request.notes,
    };
    const rawResponse = await this.httpService.post(
      this.url,
      queryParams,
      body,
      this.chatConfig.apiKey
    );
    const validationResult = this.apiResponseValidator.validate(rawResponse);
    if (validationResult instanceof Error) {
      return Promise.reject(validationResult);
    }
    return this.createMessageResponse(rawResponse);
  }

  private createMessageResponse(data: any): MessageResponse {
    return {
      message: data.response.message,
      notes: data.response.notes,
    };
  }
}
