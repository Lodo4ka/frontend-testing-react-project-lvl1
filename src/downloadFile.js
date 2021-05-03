import * as fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import formatterPath from './formatterPath';

export default async (url, dirPath) => {
  const fileName = formatterPath(url);
  const { data } = await axios.get(url);
  const filePath = path.join(dirPath, fileName);
  await fs.writeFile(filePath, data);
};
