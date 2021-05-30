import { urlError } from './erros.js';

export default (path) => {
  try {
    const { hostname, pathname } = new URL(path);
    const regexNonCharacter = new RegExp('\\W');
    const fileStrs = `${hostname}${pathname}`.split(regexNonCharacter);
    const fileName = (fileStrs[fileStrs.length - 1] === '' ? fileStrs.slice(0, -1) : fileStrs)
      .join('-');
    return `${fileName}_files`;
  } catch (e) {
    throw urlError;
  }
};
