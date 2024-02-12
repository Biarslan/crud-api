import { ServerResponse } from 'http';
import { STATUS_CODE } from './constants';

export const responseRouteNotFound = (res: ServerResponse) => {
  res.statusCode = STATUS_CODE.NOT_FOUND;
  res.end(JSON.stringify({ error: 'Route not found' }));
};
