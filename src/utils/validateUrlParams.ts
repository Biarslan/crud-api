import { responseNotValidUUID, responseRouteNotFound } from '../errors';
import { validate as validateUUID } from 'uuid';
export const validateUrlParams = ({
  url,
  expectedUrl,
}: {
  url: string | undefined;
  expectedUrl: string;
}) => {
  if (!url?.startsWith(expectedUrl)) {
    return {
      isValidUrlParams: false,
      responseCallback: responseRouteNotFound,
      providedId: null,
    };
  }

  const splittedURL = url.split('/');
  if (splittedURL.length > 4) {
    return {
      isValidUrlParams: false,
      responseCallback: responseRouteNotFound,
      providedId: null,
    };
  }

  const providedId = splittedURL[3];
  if (!(providedId && validateUUID(providedId))) {
    return {
      isValidUrlParams: false,
      responseCallback: responseNotValidUUID,
      providedId: null,
    };
  }
  return {
    isValidUrlParams: true,
    responseCallback: null,
    providedId,
  };
};
