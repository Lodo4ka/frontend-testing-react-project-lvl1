import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';

import downloadPage from '../src/index.js';

describe('download page and save in tmp directory', () => {
  const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
  const readFile = async (pathName) => fs.readFile(pathName, 'utf-8');
  const readFileBinary = async (pathName) => fs.readFile(pathName, 'binary');
  const readHTML = async (pathName) => {
    const pathFixture = getFixturePath(pathName);
    return readFile(pathFixture);
  };
  const readAssets = async (pathName) => {
    const pathFixture = getFixturePath(pathName);
    return readFileBinary(pathFixture);
  };

  const url = 'https://ru.hexlet.io/courses';
  const coursesHtmlName = 'ru-hexlet-io-courses.html';
  const htmlCoursesname = 'ru-hexlet-io-courses.html';
  const directoryAssetName = 'ru-hexlet-io-courses_files';
  const mainDomain = 'https://ru.hexlet.io';
  let tmpDir;
  let assetDir;

  beforeAll(async () => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    assetDir = path.join(tmpDir, directoryAssetName);
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('download html plain, download all imgs from url', async () => {
    const pngName = '/assets/professions/nodejs.png';
    const htmlPage = await readHTML(coursesHtmlName);
    const answerFixtureHTml = await readHTML('ru-hexlet-io-courses-answer.html');
    const nodePng = await readAssets(pngName);
    const scopeHtml = nock(mainDomain).get('/courses').reply(200, htmlPage);
    const scopePng = nock(mainDomain).get(pngName).reply(200, nodePng);

    console.log(downloadPage.toString());
    await downloadPage(url, tmpDir);

    await expect(fs.access(path.join(tmpDir, htmlCoursesname))).resolves.not.toThrow();

    const directoryPath = await fs.readdir(tmpDir);
    const assetPath = await fs.readdir(assetDir);
    const htmlResult = await readFile(path.join(tmpDir, htmlCoursesname));

    expect(directoryPath).toContain(htmlCoursesname);
    expect(htmlResult).toEqual(answerFixtureHTml);
    expect(assetPath.length).toEqual(1);
    expect(assetPath).toContain('ru-hexlet-io-assets-professions-nodejs.png');
  });
});
