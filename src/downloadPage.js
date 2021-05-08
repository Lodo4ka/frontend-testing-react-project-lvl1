import * as fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';

import createHTMLName from './createHTMLName';
import createDirectoryName from './createDirectoryName';
import createFileName from './createFileName';
import createFileURL from './createFileURL';

export default async (url, dirPath) => {
  const fileName = createHTMLName(url);
  const dirName = createDirectoryName(url);
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const urlsImgs = $('img').map((i, img) => $(img).attr('src')).toArray();
  const blobImgs = await Promise.all(urlsImgs.map((urlArg) => {
    const imgUrl = createFileURL(urlArg, url);
    return axios.get(imgUrl, { responseType: 'arraybuffer' });
  }));

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

  const formattedPaths = await Promise.all(buffBlobs.map(({ data: dataArg, name }) => {
    const fullPath = path.join(directoryPath, name);
    const imgPath = path.join(dirName, name);
    fs.writeFile(fullPath, dataArg);
    return imgPath;
  }));

  $('img').map((i, el) => $(el).attr('src', formattedPaths[i]));

  const htmlData = $.html();

  await fs.writeFile(filePath, htmlData);
};
