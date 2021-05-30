import { serverError } from './erros.js';
import axios from './ajaxConfig.js';

export default async (url, config = {}) => {
  try {
    const data = await axios.get(url, config);
    return data;
  } catch (e) {
    throw serverError;
  }
};
