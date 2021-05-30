import { urlError } from './erros.js';

export default (name, url) => {
  function isValidWebUrl(urlArg) {
    const regEx = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return regEx.test(urlArg);
  }

  if (isValidWebUrl(name)) {
    return name;
  }

  try {
    const urlResult = new URL(url);
    urlResult.pathname = name;
    return urlResult.toString();
  } catch (e) {
    throw urlError;
  }
};
