import {StringEnum} from "@feathersjs/typebox";

export const SourceTypeMap = {
  lens: 'lens',
  ondsel: 'ondseles',
  freecad: 'freecad',
  unknown: 'unknown'
}

export const SourceType = StringEnum([
  SourceTypeMap.lens,
  SourceTypeMap.ondsel,
  SourceTypeMap.freecad,
  SourceTypeMap.unknown,
])

export const ConnectionTypeMap = {
  rest: 'rest',
  socketio: 'socketio',
};

export const ConnectionType = StringEnum([
  ConnectionTypeMap.rest,
  ConnectionTypeMap.socketio,
])
