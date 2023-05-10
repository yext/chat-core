/**
 * Represents raw query params, without any sanitization.
 *
 * @internal
 */
export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Represents defined query params, without undefined or null values.
 *
 * @internal
 */
export interface SanitizedQueryParams {
  [key: string]: string | number | boolean;
}
