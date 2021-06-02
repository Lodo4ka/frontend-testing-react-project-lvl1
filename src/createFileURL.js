import validURl from 'valid-url';

export default (name, url) => {
  if (validURl.isWebUri(name)) {
    return name;
  }

  const urlResult = new URL(url);
  urlResult.pathname = name;
  return urlResult.toString();
};
