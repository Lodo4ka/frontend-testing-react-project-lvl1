import { urlError } from './erros.js';

export default (url, urlHost) => {
  try {
    const { hostname: currentHost } = new URL(url);
    const { hostname: pageHost } = new URL(urlHost);
    return currentHost === pageHost;
  } catch (e) {
    throw urlError;
  }
};
