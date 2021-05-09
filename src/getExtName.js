export default (url) => {
  const extName = ['png', 'css', 'js'];
  const strURl = url.split('.');
  const lastEl = strURl[strURl.length - 1];
  return extName.some((ext) => ext === lastEl) ? lastEl : 'html';
};
