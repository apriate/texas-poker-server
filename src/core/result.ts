import { ResultCode } from 'src/interfaces/IResult';

export class ResultData {
  constructor(
    public code = ResultCode.SUCCESS,
    public msg?: string,
    public data?: any,
  ) {
    this.code = code;
    this.msg = msg || '操作成功';
    this.data = data || null;
  }

  static success(data: any) {
    return new ResultData(ResultCode.SUCCESS, '操作成功', data);
  }

  static fail(msg: string) {
    return new ResultData(ResultCode.FAIL, msg, {});
  }
}
