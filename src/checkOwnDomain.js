export default (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname === 'ru.hexlet.io';
  } catch (e) {
    throw new Error('non valid url');
  }
};
