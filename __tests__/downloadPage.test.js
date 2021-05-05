import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';
import axios from 'axios';
import nock from 'nock';

import {
  describe, it, expect, beforeEach, afterAll, beforeAll,
} from '@jest/globals';
import downloadFile from '../src/downloadPage';
import createHTMLName from '../src/createHTMLName';
import createDirectoryName from '../src/createDirectoryName';
import createFileName from '../src/createFileName';
import createFileURL from '../src/createFileURL';

axios.defaults.adapter = require('axios/lib/adapters/http');

describe('download page and save in tmp directory', () => {
  const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
  const readFile = async (pathName) => fs.readFile(pathName, 'utf-8');
  const readFileBinary = async (pathName) => fs.readFile(pathName, 'binary');

  const url = 'https://ru.hexlet.io/courses';
  const coursesHtmlName = 'ru-hexlet-io-courses.html';
  const formattedFile = 'ru-hexlet-io-courses.html';
  const directoryAssetName = 'ru-hexlet-io-courses_files';
  let tmpDir;
  let htmlPage;

  beforeAll(async () => {
    nock.disableNetConnect();
    const pathFixture = getFixturePath(coursesHtmlName);
    htmlPage = await readFile(pathFixture);
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('create file name by html extension', () => {
    const result = createHTMLName(url);
    expect(result).toBe(coursesHtmlName);
  });

  it('create directory name by file name', () => {
    const result = createDirectoryName(url);
    expect(result).toBe(directoryAssetName);
  });

  it('create png name by self name and host name', () => {
    const pngURl = 'https://cdn2.hexlet.io/assets/professions/program-f26fba51e364abcd7f15475edb68d93958426d54c75468dc5bc65e493a586226.png';
    const pngName = 'ru-hexlet-io-assets-professions-program-f26fba51e364abcd7f15475edb68d93958426d54c75468dc5bc65e493a586226.png';
    const result = createFileName(pngURl, url);
    expect(result).toBe(pngName);
  });

  it('create png url', () => {
    const pngName = '/assets/professions/nodejs.png';
    const result = createFileURL(pngName, url);
    const urlAnswer = new URL('https://ru.hexlet.io');
    urlAnswer.pathname = pngName;
    const answer = urlAnswer.toString();
    expect(result).toBe(answer);
  });

  it('download html plain, download all imgs from url', async () => {
    const pngName = '/assets/professions/nodejs.png';
    const assetPathPng = getFixturePath(pngName);
    const answerFixture = getFixturePath('ru-hexlet-io-courses-answer.html');
    const answerFixtureHTml = await readFile(answerFixture);
    const nodePng = await readFileBinary(assetPathPng);
    nock('https://ru.hexlet.io').get('/courses').reply(200, htmlPage);
    nock('https://ru.hexlet.io').get(pngName).reply(200, nodePng);

    await downloadFile(url, tmpDir);
    const assetDir = path.join(tmpDir, directoryAssetName);
    const directoryPath = await fs.readdir(tmpDir);
    const dirAssets = await fs.readdir(assetDir);
    const htmlResult = await readFile(path.join(tmpDir, formattedFile));
    expect(directoryPath).toContain(formattedFile);
    expect(dirAssets.length).toEqual(1);
    expect(dirAssets).toContain('ru-hexlet-io-assets-professions-nodejs.png');
    expect(htmlResult).toEqual(answerFixtureHTml);
  });
});
