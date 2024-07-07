export enum ResultCode {
  SUCCESS = '000000',
  FAIL = '999999',
  ONT_AUTH = '100000',
}

export interface IResult {
  code: ResultCode;
  message: string;
  data: any;
}
