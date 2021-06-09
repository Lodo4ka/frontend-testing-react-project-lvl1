import * as fs from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import axios from 'axios';
import debug from 'debug';

import createHTMLName from './createHTMLName.js';
import createDirectoryName from './createDirectoryName.js';
import createFileName from './createFileName.js';
import checkOwnDomain from './checkOwnDomain.js';
import getExtName from './getExtName.js';

const log = debug('page-loader');

const downloadFiles = async ($, assetName, url, directoryPathToSave, dirToSaveName) => {
  const attrFile = assetName === 'link' ? 'href' : 'src';
  const filterAsset = $(assetName).filter((i, elem) => {
    const urlArg = new URL($(elem).attr(attrFile), url);
    return checkOwnDomain(urlArg, url);
  });
  const urlElms = filterAsset
    .map((i, element) => $(element).attr(attrFile))
    .toArray()
    .map((elem) => new URL(elem, url).toString());
  const blobElements = await Promise.all(
    urlElms
      .map((urlArg) => axios(urlArg, { responseType: 'arraybuffer' })),
  );
  const names = blobElements
    .map(({ config: { url: urlBlob } }) => createFileName(urlBlob, url, getExtName(urlBlob)));
  const destinationPaths = names.map((name) => path.join(directoryPathToSave, name));
  const updatedElemPaths = names.map((name) => path.join(dirToSaveName, name));
  await Promise.all(blobElements.map(async ({ data }, index) => {
    await fs.writeFile(destinationPaths[index], data);
    log('file %s was save', destinationPaths[index]);
  }));
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
