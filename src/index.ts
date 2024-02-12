import http, { ServerResponse, IncomingMessage } from 'http';
import { STATUS_CODE } from './constants';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import 'dotenv/config';
import {
  responseNotValidUUID,
  responseNotValidUser,
  responseProvidedIdNotFound,
  responseRouteNotFound,
} from './errors';
import { IUser, IUserDB } from './interfaces';
import { parseBody } from './utils/parseBody';
import { validateUser } from './utils/validateUser';
const PORT = process.env.PORT || 4000;

let usersDB: IUserDB[] = [];

const handleRequest = async (res: ServerResponse, req: IncomingMessage) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  switch (req.method) {
    case 'GET': {
      if (req.url === '/api/users') {
        console.log('GET_ALL_USERS');
        res.statusCode = STATUS_CODE.OK;
        res.end(JSON.stringify(usersDB));
      } else if (req.url?.startsWith('/api/users/')) {
        const splittedURL = req.url.split('/');
        const providedId = splittedURL[3];
        if (splittedURL.length > 4) responseRouteNotFound(res);
        else if (providedId && validateUUID(providedId)) {
          const selectedUser = usersDB.find((user) => user.id === providedId);
          if (selectedUser) {
            res.statusCode = STATUS_CODE.OK;
            res.end(JSON.stringify(selectedUser));
          } else {
            res.statusCode = STATUS_CODE.NOT_FOUND;
            res.end(
              JSON.stringify({ error: 'User with provided ID not found' }),
            );
          }
        } else {
          res.statusCode = STATUS_CODE.BAD_REQUEST;
          res.end(JSON.stringify({ error: 'Provided id is not valid uuid' }));
        }
      } else {
        responseRouteNotFound(res);
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
      if (!req.url?.startsWith('/api/users/')) {
        responseRouteNotFound(res);
        return;
      }

      const splittedURL = req.url.split('/');
      if (splittedURL.length > 4) {
        responseRouteNotFound(res);
        return;
      }

      const providedId = splittedURL[3];
      if (!(providedId && validateUUID(providedId))) {
        responseNotValidUUID(res);
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
      if (!req.url?.startsWith('/api/users/')) {
        responseRouteNotFound(res);
        return;
      }
      const splittedURL = req.url.split('/');

      if (splittedURL.length > 4) {
        responseRouteNotFound(res);
        return;
      }

      const providedId = splittedURL[3];
      if (!(providedId && validateUUID(providedId))) {
        responseNotValidUUID(res);
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

const server = http.createServer((req, res) => {
  handleRequest(res, req).catch(() => {
    res.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
    res.end(JSON.stringify({ error: 'Internal Server error occurred' }));
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
