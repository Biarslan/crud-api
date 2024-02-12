import { ServerResponse } from 'http';
import { STATUS_CODE } from './constants';

export const responseRouteNotFound = (res: ServerResponse) => {
  res.statusCode = STATUS_CODE.NOT_FOUND;
  res.end(JSON.stringify({ error: 'Route not found' }));
};

export const responseNotValidUUID = (res: ServerResponse) => {
  res.statusCode = STATUS_CODE.BAD_REQUEST;
  res.end(JSON.stringify({ error: 'Provided id is not valid uuid' }));
};
export const responseProvidedIdNotFound = (res: ServerResponse) => {
  res.statusCode = STATUS_CODE.NOT_FOUND;
  res.end(JSON.stringify({ error: 'User with provided ID not found' }));
};

export const responseNotValidUser = (
  res: ServerResponse,
  errorArray: string[],
) => {
  res.statusCode = STATUS_CODE.BAD_REQUEST;
  res.end(JSON.stringify({ error: errorArray.join('. ') }));
};
