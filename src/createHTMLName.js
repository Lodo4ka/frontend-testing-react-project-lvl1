export default (path) => {
  try {
    const { hostname, pathname } = new URL(path);
    const regexNonCharacter = new RegExp('\\W');
    const fileName = `${hostname}${pathname}`.split(regexNonCharacter).join('-');
    return `${fileName}.html`;
  } catch (e) {
    throw new Error('non valid url');
  }
};
