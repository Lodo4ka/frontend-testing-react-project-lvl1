import { serverError } from './erros';
import axios from './ajaxConfig';

export default async (url, config = {}) => {
  try {
    const data = await axios.get(url, config);
    return data;
  } catch (e) {
    throw serverError;
  }
};
