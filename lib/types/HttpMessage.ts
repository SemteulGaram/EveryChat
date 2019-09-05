export interface IReqSendText {
  t: string;    // text
  s?: string;   // sender
}

export function validateReqSendText(reqMsgSend: any): boolean {
  return reqMsgSend && reqMsgSend.t && typeof reqMsgSend.t === 'string';
}

export interface IRequestMessage {
  m: string;          // method
  i?: string;         // id
  r?: string;         // room
  v?: IReqSendText;   // value(data)
}
/* method list
 * c: requestConnection
 * u: getUpdate
 * st: sendTextMessage (with IReqSendText)
 */

export function validateRequestMessage(reqMsg: any): boolean {
  if (reqMsg && reqMsg.m && typeof reqMsg.m === 'string') {
    if (reqMsg.m === 'st') {
      return validateReqSendText(reqMsg.v);
    } else {
      return true;
    }
  }
  return false;
}

export interface IResUpdateElement {
  t: string;  // type
  m?: string; // message(text) (type t)
  s?: string; // sender (type t)
}
/* type list
 * t: text
 */

export interface IResUpdate {
  l: Array<IResUpdateElement>;
}

export interface IResponseMessage {
  s: boolean; // success
  e?: string; // error code
  u?: IResUpdate; // update data (IResUpdate)
}