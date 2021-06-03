import * as fs from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import axios from 'axios';

import createHTMLName from './createHTMLName.js';
import createDirectoryName from './createDirectoryName.js';
import createFileName from './createFileName.js';
import createFileURL from './createFileURL.js';
import checkOwnDomain from './checkOwnDomain.js';
import getExtName from './getExtName.js';

// don't throw exception on 4xx and 5xx
axios.defaults.validateStatus = () => true;

const downloadFiles = async ($, assetName, url, directoryPath, dirName) => {
  const attrFile = assetName === 'link' ? 'href' : 'src';
  const filterAsset = $(assetName).filter((i, elem) => {
    const urlArg = createFileURL($(elem).attr(attrFile), url);
    return checkOwnDomain(urlArg, url);
  });
  const urlsElms = filterAsset
    .map((i, element) => $(element).attr(attrFile))
    .toArray()
    .map((elem) => createFileURL(elem, url));
  const blobElements = await Promise.all(
    urlsElms
      .map((urlArg) => axios(urlArg, { responseType: 'arraybuffer' })),
  );
  const updatedElemPaths = await Promise.all(
    blobElements
      .map(({ data, config: { url: urlBlob } }) => {
        const name = createFileName(urlBlob, url, getExtName(urlBlob));
        const fullPath = path.join(directoryPath, name);
        const elemPath = path.join(dirName, name);
        fs.writeFile(fullPath, data);
        return elemPath;
      }),
  );
  filterAsset.map((i, el) => $(el).attr(attrFile, updatedElemPaths[i]));
};

export default async (url, dirPath = process.cwd()) => {
  const fileName = createHTMLName(url);
  const dirName = createDirectoryName(url);
  const filePath = path.join(dirPath, fileName);
  const directoryPath = path.join(dirPath, dirName);
  const { data } = await axios(url);

  const $ = cheerio.load(data);
  await fs.mkdir(directoryPath);

  await downloadFiles($, 'img', url, directoryPath, dirName);
  await downloadFiles($, 'script', url, directoryPath, dirName);
  await downloadFiles($, 'link', url, directoryPath, dirName);

  const htmlData = $.html();

  await fs.writeFile(filePath, htmlData);
};
