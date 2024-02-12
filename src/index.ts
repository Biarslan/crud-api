import http from 'http';
import { validate as validateUUID } from 'uuid';
// import { v4 as uuidv4, validate } from 'uuid';
import 'dotenv/config';

const PORT = process.env.PORT || 4000;

enum STATUS_CODE {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// type StatusCodeType = keyof typeof STATUS_CODE;

// const sendResponse = (response: ServerResponse, status: StatusCodeType, body:) => {

// };

interface IUser {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

const usersDB: IUser[] = [];
const server = http.createServer((req, res) => {
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
        if (splittedURL.length > 4) {
          res.statusCode = STATUS_CODE.NOT_FOUND;
          res.end(JSON.stringify({ error: 'Route not found' }));
        } else if (providedId && validateUUID(providedId)) {
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
        res.statusCode = STATUS_CODE.NOT_FOUND;
        res.end(JSON.stringify({ error: 'Route not found' }));
      }
      break;
    }

    case 'POST':
      console.log('POST');

      break;
    case 'PUT':
      console.log('PUT');
      break;
    case 'DELETE':
      console.log('DELETE');
      break;
    default:
      console.log('DEFAULT');
      res.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
      res.end(JSON.stringify({ error: 'This method does not supports' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
