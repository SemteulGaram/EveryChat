export interface IReqSendText {
  t: string;    // text
  s?: string;   // sender
}

export function validateReqSendText(reqMsgSend: any): IReqSendText|null {
  if (reqMsgSend && reqMsgSend.t && typeof reqMsgSend.t === 'string') {
    return {
      t: reqMsgSend.t,
      s: reqMsgSend.s
    }
  }
  return null;
}

export interface IRequestMessage {
  m: string;          // method
  r: string;          // room
  i?: string;         // id (except request method c)
  v?: IReqSendText;   // value(data) (request method st)
}
/* method list
 * c: requestConnection
 * u: getUpdate
 * st: sendTextMessage
 */

export function validateRequestMessage(reqMsg: any): IRequestMessage|null {
  if (reqMsg && reqMsg.m && ['c', 'u', 'st'].indexOf(reqMsg.m) !== -1) {
    if (typeof reqMsg.r !== 'string') return null;
    if (reqMsg.m !== 'c' && typeof reqMsg.i !== 'string') return null;

    if (reqMsg.m === 'st') {
      const reqSendText: IReqSendText|null = validateReqSendText(reqMsg.v);
      if (reqSendText) {
        return {
          m: reqMsg.m,
          r: reqMsg.r,
          i: reqMsg.i,
          v: reqSendText
        };
      }
    } else {
      return {
        m: reqMsg.m,
        r: reqMsg.r,
        i: reqMsg.i
      };
    }
  }
  return null;
}

export interface IResUpdateElement {
  t: string;  // update type
  m?: string; // message(text) (type t)
  s?: string; // sender (type t)
}
/* update type list
 * t: text
 */

export interface IResUpdate {
  l: Array<IResUpdateElement>;
}

export interface IResponseMessage {
  s: boolean;     // success
  e?: string;     // error code (when none success)
  i?: string      // id (response method 'c')
  u?: IResUpdate; // update data (response method 'st')
}