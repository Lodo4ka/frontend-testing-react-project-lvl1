export default (path) => {
  try {
    const { hostname, pathname } = new URL(path);
    const regexNonCharacter = new RegExp('\\W');
    const fileName = `${hostname}${pathname}`.split(regexNonCharacter).join('-');
    return `${fileName}_files`;
  } catch (e) {
    throw new Error('non valid url');
  }
};
