import http, { ServerResponse, IncomingMessage } from 'http';
import { JSON_PARSE_ERROR_MESSAGE, STATUS_CODE } from './constants';
import { v4 as uuidv4 } from 'uuid';

import {
  responseNotValidUser,
  responseProvidedIdNotFound,
  responseRouteNotFound,
} from './errors';

import { IUser, IUserDB } from './interfaces';
import { parseBody } from './utils/parseBody';
import { validateUser } from './utils/validateUser';
import { validateUrlParams } from './utils/validateUrlParams';

let usersDB: IUserDB[] = [];

const handleRequest = async (res: ServerResponse, req: IncomingMessage) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  switch (req.method) {
    case 'GET': {
      if (req.url === '/api/users') {
        res.statusCode = STATUS_CODE.OK;
        res.end(JSON.stringify(usersDB));
        return;
      }
      const { isValidUrlParams, responseCallback, providedId } =
        validateUrlParams({
          url: req.url,
          expectedUrl: '/api/users/',
        });

      if (!isValidUrlParams && responseCallback) {
        responseCallback(res);
        return;
      }
      const selectedUser = usersDB.find((user) => user.id === providedId);
      if (selectedUser) {
        res.statusCode = STATUS_CODE.OK;
        res.end(JSON.stringify(selectedUser));
      } else {
        responseProvidedIdNotFound(res);
      }

      break;
    }

    case 'POST': {
      if (req.url === '/api/users') {
        const user = await parseBody(req);
        const { isValidUser, errorArray } = validateUser(user);

        if (isValidUser) {
          const newUser: IUserDB = { id: uuidv4(), ...(user as IUser) };
          usersDB.push(newUser);
          res.statusCode = STATUS_CODE.CREATED;
          res.end(JSON.stringify(newUser));
        } else {
          res.statusCode = STATUS_CODE.BAD_REQUEST;
          res.end(JSON.stringify({ error: errorArray.join('. ') }));
        }
      } else {
        responseRouteNotFound(res);
      }
      break;
    }

    case 'PUT': {
      const { isValidUrlParams, responseCallback, providedId } =
        validateUrlParams({
          url: req.url,
          expectedUrl: '/api/users/',
        });
      if (!isValidUrlParams && responseCallback) {
        responseCallback(res);
        return;
      }

      const selectedUser = usersDB.find((user) => user.id === providedId);

      if (selectedUser) {
        const user = await parseBody(req);
        const { isValidUser, errorArray } = validateUser(user);

        if (isValidUser) {
          usersDB.forEach((_user, index) => {
            if (_user.id === selectedUser.id)
              usersDB[index] = { ..._user, ...(user as IUser) };
          });
          const updatedUser = usersDB.find((user) => user.id === providedId);
          res.statusCode = STATUS_CODE.OK;
          res.end(JSON.stringify(updatedUser));
        } else {
          responseNotValidUser(res, errorArray);
        }
      } else {
        responseProvidedIdNotFound(res);
      }

      break;
    }

    case 'DELETE': {
      const { isValidUrlParams, responseCallback, providedId } =
        validateUrlParams({
          url: req.url,
          expectedUrl: '/api/users/',
        });

      if (!isValidUrlParams && responseCallback) {
        responseCallback(res);
        return;
      }

      const selectedUser = usersDB.find((user) => user.id === providedId);

      if (selectedUser) {
        usersDB = usersDB.filter((_user) => _user.id !== providedId);
        res.statusCode = STATUS_CODE.NO_CONTENT;
        res.end();
      } else {
        responseProvidedIdNotFound(res);
      }
      break;
    }

    default:
      console.log('DEFAULT');
      res.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
      res.end(JSON.stringify({ error: 'This method does not supports' }));
  }
};

export const server = http.createServer((req, res) => {
  handleRequest(res, req).catch((err) => {
    res.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
    res.end(
      JSON.stringify({
        error:
          err.message === JSON_PARSE_ERROR_MESSAGE
            ? JSON_PARSE_ERROR_MESSAGE
            : 'Internal Server error occurred',
      }),
    );
  });
});
