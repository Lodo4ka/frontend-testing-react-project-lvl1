import { urlError } from './erros';

export default (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname === 'ru.hexlet.io';
  } catch (e) {
    throw urlError;
  }
};
