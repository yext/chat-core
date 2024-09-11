import { defaultApiVersion } from "../constants";
import { HttpService, HttpServiceImpl } from "../http/HttpService";
import { EndpointsFactory } from "./EndpointsFactory";
import { StreamResponse } from "./StreamResponse";
import {
  ChatCore,
  ChatConfig,
  InternalConfig,
  MessageRequest,
  MessageResponse,
  Endpoints,
  ApiError,
} from "../models";
import { ApiMessageRequest } from "../models/endpoints/MessageRequest";
import { ApiResponse } from "../models/http/ApiResponse";
import { QueryParams } from "../models/http/params";
import { ApiResponseValidator } from "../validation/ApiResponseValidator";

/**
 * The primary class for the chat-core library.
 *
 * @internal
 */
export class ChatCoreImpl implements ChatCore {
  private chatConfig: ChatConfig;
  private httpService: HttpService;
  private endpoints: Endpoints;
  private internalConfig: InternalConfig;

  constructor(chatConfig: ChatConfig, internalConfig: InternalConfig = {}) {
    this.chatConfig = chatConfig;
    this.httpService = new HttpServiceImpl();
    this.endpoints =
      chatConfig.endpoints ?? EndpointsFactory.getEndpoints(this.chatConfig);
    this.internalConfig = internalConfig;
  }

  async getNextMessage(request: MessageRequest): Promise<MessageResponse> {
    const queryParams: QueryParams = { v: defaultApiVersion };
    const body: ApiMessageRequest = {
      ...request,
      version: this.chatConfig.version,
      promptPackage: this.internalConfig.promptPackage,
      locationOverride: this.chatConfig.locationOverride,
    };
    const rawResponse = await this.httpService.post(
      this.endpoints.chat,
      queryParams,
      body,
      this.chatConfig.apiKey
    );
    const jsonResponse: ApiResponse = await rawResponse.json();
    if (!rawResponse.ok) {
      const validationResult = ApiResponseValidator.validate(
        jsonResponse,
        rawResponse.status
      );
      return validationResult
        ? Promise.reject(validationResult)
        : Promise.reject(
            new ApiError(
              "An error occurred while processing request to Chat API."
            )
          );
    }
    return this.createMessageResponse(jsonResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createMessageResponse(data: any): MessageResponse {
    return {
      conversationId: data.response.conversationId,
      message: data.response.message,
      notes: data.response.notes,
      integrationDetails: data.response.integrationDetails,
    };
  }

  async streamNextMessage(request: MessageRequest): Promise<StreamResponse> {
    const queryParams: QueryParams = { v: defaultApiVersion };
    const body: ApiMessageRequest = {
      ...request,
      version: this.chatConfig.version,
      promptPackage: this.internalConfig.promptPackage,
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
