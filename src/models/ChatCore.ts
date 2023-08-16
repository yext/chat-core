import { StreamResponse } from "../infra/StreamResponse"
import { MessageRequest } from "./endpoints/MessageRequest"
import { MessageResponse } from "./endpoints/MessageResponse"

/**
 * Provide methods for interacting with Chat API.
 * 
 * @public
 */
export interface ChatCore {
  /**
   * Make a request to Chat API to generate the next message.
   *
   * @remarks
   * If rejected, an Error is returned.
   *
   * @param request - request to get next message
   */
  getNextMessage(request: MessageRequest): Promise<MessageResponse>
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
  streamNextMessage(request: MessageRequest): Promise<StreamResponse>
}