export default (path, urlHost) => {
  try {
    const { pathname } = new URL(path);
    const { hostname } = new URL(urlHost);
    const regexNonCharacter = new RegExp('\\W');
    const fileName = `${hostname}${pathname}`.split(regexNonCharacter).slice(0, -1).join('-');
    return `${fileName}.png`;
  } catch (e) {
    throw new Error('non valid url');
  }
};
