import * as fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';

import createHTMLName from './createHTMLName';
import createDirectoryName from './createDirectoryName';
import createFileName from './createFileName';

export default async (url, dirPath) => {
  const fileName = createHTMLName(url);
  const dirName = createDirectoryName(url);
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const urlsImgs = $('img').map((i, img) => $(img).attr('src')).toArray();
  const blobImgs = await Promise.all(urlsImgs.map((urlArg) => axios.get(urlArg, { responseType: 'arraybuffer' })));
  const buffBlobs = blobImgs.map(({ data: dataBlob, config: { url: urlArg } }) => ({
    data: Buffer
      .from(dataBlob),
    name: createFileName(urlArg, url),
  }));
  const filePath = path.join(dirPath, fileName);
  const directoryPath = path.join(dirPath, dirName);

  try {
    await fs.access(directoryPath);
  } catch (e) {
    await fs.mkdir(directoryPath);
  }

  await Promise.all(buffBlobs.map(({ data: dataArg, name }) => {
    const fullPath = path.join(directoryPath, name);
    return fs.writeFile(fullPath, dataArg);
  }));

  await fs.writeFile(filePath, data);
};
