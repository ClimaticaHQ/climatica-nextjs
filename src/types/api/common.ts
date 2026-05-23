import { RESULT_STATUSES } from "@/constants";

export type TResultStatus = (typeof RESULT_STATUSES)[keyof typeof RESULT_STATUSES];

export interface TApiResponse<T> {
  status: TResultStatus;
  message: string;
  data: T;
}
