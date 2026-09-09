export interface MetaQuery {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiResponse<T> {
  statusCode?: number;
  success: boolean;
  message?: string;
  meta?: MetaQuery;
  data: T;
}

export interface GenericErrorResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  errorSources?: Array<{
    path: string | number;
    message: string;
  }>;
  stack?: string;
}
