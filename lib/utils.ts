// TODO
//@ts-ignore
let _uidCount: number = parseInt(Math.random() * 0x100000000);

export function createUid (): string {
  if (_uidCount >= 0x100000000) _uidCount = 0;

  return (_uidCount++).toString(16).padStart(8, '0');
}