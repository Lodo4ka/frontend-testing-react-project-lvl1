import axios from './ajaxConfig.js';

export default async (url, config = {}) => {
  const data = await axios.get(url, config);
  return data;
};
