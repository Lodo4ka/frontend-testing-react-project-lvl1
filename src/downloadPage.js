import * as fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';

import createHTMLName from './createHTMLName';
import createDirectoryName from './createDirectoryName';
import createFileName from './createFileName';
import createFileURL from './createFileURL';
import checkOwnDomain from './checkOwnDomain';
import getExtName from './getExtName';

const downloadFiles = async ($, assetName, url, directoryPath, dirName) => {
  const attrFile = assetName === 'link' ? 'href' : 'src';
  const filterAsset = $(assetName).filter((i, elem) => {
    const urlArg = createFileURL($(elem).attr(attrFile), url);
    return checkOwnDomain(urlArg);
  });
  const urlsElms = filterAsset
    .map((i, element) => $(element).attr(attrFile))
    .toArray()
    .map((elem) => createFileURL(elem, url));
  const blobElements = await Promise.all(
    urlsElms
      .map((urlArg) => axios.get(urlArg, { responseType: 'arraybuffer' })),
  );
  const buffBlobs = blobElements.map(({ data: dataBlob, config: { url: urlArg } }) => ({
    data: Buffer
      .from(dataBlob),
    name: createFileName(urlArg, url, getExtName(urlArg)),
  }));
  const updatedElemPaths = await Promise.all(buffBlobs.map(({ data: dataArg, name }) => {
    const fullPath = path.join(directoryPath, name);
    const elemPath = path.join(dirName, name);
    fs.writeFile(fullPath, dataArg);
    return elemPath;
  }));
  filterAsset.map((i, el) => {
    $(el)
      .attr(attrFile, updatedElemPaths[i]);
    if (assetName === 'link') {
      $(el)
        .attr('media', 'all');
    }
    return el;
  });
};

export default async (url, dirPath) => {
  const fileName = createHTMLName(url);
  const dirName = createDirectoryName(url);
  const filePath = path.join(dirPath, fileName);
  const directoryPath = path.join(dirPath, dirName);
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  try {
    await fs.access(directoryPath);
  } catch (e) {
    await fs.mkdir(directoryPath);
  }

  await downloadFiles($, 'img', url, directoryPath, dirName);
  await downloadFiles($, 'script', url, directoryPath, dirName);
  await downloadFiles($, 'link', url, directoryPath, dirName);

  const htmlData = $.html();

  await fs.writeFile(filePath, htmlData);
};
