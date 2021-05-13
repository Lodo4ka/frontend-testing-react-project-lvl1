import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';
import {
  describe, it, expect, beforeEach, afterAll, beforeAll,
} from '@jest/globals';

import axios from '../src/ajaxConfig';
import axiosGet from '../src/apiService';
import { urlError, serverError } from '../src/erros';
import downloadPage from '../src/downloadPage';
import createHTMLName from '../src/createHTMLName';
import createDirectoryName from '../src/createDirectoryName';
import createFileName from '../src/createFileName';
import createFileURL from '../src/createFileURL';
import checkOwnDomain from '../src/checkOwnDomain';
import getExtName from '../src/getExtName';

axios.defaults.adapter = require('axios/lib/adapters/http');

describe('download page and save in tmp directory', () => {
  const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
  const readFile = async (pathName) => fs.readFile(pathName, 'utf-8');
  const readFileBinary = async (pathName) => fs.readFile(pathName, 'binary');

  const readResult = async (tmpDir, assetDir, htmlFile) => {
    const directoryPath = await fs.readdir(tmpDir);
    const assetPath = await fs.readdir(assetDir);
    const htmlResult = await readFile(path.join(tmpDir, htmlFile));
    return {
      directoryPath,
      assetPath,
      htmlResult,
    };
  };

  const url = 'https://ru.hexlet.io/courses';
  const urlRoot = 'https://ru.hexlet.io';
  const coursesHtmlName = 'ru-hexlet-io-courses.html';
  const htmlCoursesname = 'ru-hexlet-io-courses.html';
  const directoryAssetName = 'ru-hexlet-io-courses_files';
  const pngURl = 'https://cdn2.hexlet.io/assets/professions/program-f26fba51e364abcd7f15475edb68d93958426d54c75468dc5bc65e493a586226.png';
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

  it('create file name by html extension', () => {
    const result = createHTMLName(url);
    expect(result).toBe(coursesHtmlName);
  });

  it('create file name by html extension in root path', () => {
    const result = createHTMLName(urlRoot);
    expect(result).toBe('ru-hexlet-io.html');
  });

  it('create directory name by file name', () => {
    const result = createDirectoryName(url);
    expect(result).toBe(directoryAssetName);
  });

  it('create directory name by file name in root path', () => {
    const result = createDirectoryName(urlRoot);
    expect(result).toBe('ru-hexlet-io_files');
  });

  it('get extension name from url with explicitly extension', () => {
    const extName = getExtName(pngURl);
    expect(extName).toBe('png');
  });

  it('get extension name from url with explicitly no extension', () => {
    const extName = getExtName(url);
    expect(extName).toBe('html');
  });

  it('create png name by self name and host name', () => {
    const pngName = 'ru-hexlet-io-assets-professions-program-f26fba51e364abcd7f15475edb68d93958426d54c75468dc5bc65e493a586226.png';
    const result = createFileName(pngURl, url, 'png');
    expect(result).toBe(pngName);
  });

  it('create html file by root path without extension', () => {
    const answer = 'ru-hexlet-io-courses.html';
    const result = createFileName(url, url, 'html');
    expect(result).toBe(answer);
  });

  it('check own domain in url', () => {
    const resultStripe = checkOwnDomain('https://js.stripe.com/v3/');
    const resultHexlet = checkOwnDomain('https://ru.hexlet.io/packs/js/runtime.js');
    expect(resultStripe).toBeFalsy();
    expect(resultHexlet).toBeTruthy();
  });

  it('create png url', () => {
    const pngName = '/assets/professions/nodejs.png';
    const result = createFileURL(pngName, url);
    const urlAnswer = new URL(mainDomain);
    urlAnswer.pathname = pngName;
    const answer = urlAnswer.toString();
    expect(result).toBe(answer);
  });

  it('download html plain, download all imgs from url', async () => {
    const pathFixture = getFixturePath(coursesHtmlName);
    const htmlPage = await readFile(pathFixture);
    const pngName = '/assets/professions/nodejs.png';
    const assetPathPng = getFixturePath(pngName);
    const answerFixture = getFixturePath('ru-hexlet-io-courses-answer.html');
    const answerFixtureHTml = await readFile(answerFixture);
    const nodePng = await readFileBinary(assetPathPng);
    const scopeHtml = nock(mainDomain).get('/courses').reply(200, htmlPage);
    const scopePng = nock(mainDomain).get(pngName).reply(200, nodePng);

    await downloadPage(url, tmpDir);

    const { directoryPath, assetPath, htmlResult } = await readResult(
      tmpDir,
      assetDir,
      htmlCoursesname,
    );

    expect(directoryPath).toContain(htmlCoursesname);
    expect(htmlResult).toEqual(answerFixtureHTml);
    expect(assetPath.length).toEqual(1);
    expect(assetPath).toContain('ru-hexlet-io-assets-professions-nodejs.png');
    scopeHtml.done();
    scopePng.done();
  });

  it('download all url sources from imgs, links, scripts', async () => {
    const assetList = [
      '/assets/professions/nodejs.png',
      '/assets/application.css',
      '/packs/js/runtime.js',
    ];
    const assetsPaths = await Promise.all(
      assetList.map((asset) => ({ urlAsset: asset, pathAsset: getFixturePath(asset) }))
        .map(async ({ urlAsset, pathAsset }) => ({ urlAsset, data: readFileBinary(pathAsset) })),
    );
    const answerFixture = getFixturePath('ru-hexlet-io-courses-2-answer.html');
    const answerFixtureHTml = await readFile(answerFixture);
    const assetScopes = assetsPaths
      .map(({ urlAsset, data }) => nock(mainDomain).get(urlAsset).reply(200, data));
    const rootAssetDir = path.join(tmpDir, 'ru-hexlet-io_files');
    const htmlFixture = getFixturePath('ru-hexlet-io-courses-2.html');
    const htmlPage = await readFile(htmlFixture);
    const htmlPageCourses = await readFileBinary(htmlFixture);
    const scopeRoot = nock(mainDomain).get('/').reply(200, htmlPage);
    const scopeHTML = nock(mainDomain).get('/courses').reply(200, htmlPageCourses);

    await downloadPage(urlRoot, tmpDir);

    const { directoryPath, assetPath, htmlResult } = await readResult(
      tmpDir,
      rootAssetDir,
      'ru-hexlet-io.html',
    );
    expect(directoryPath).toContain('ru-hexlet-io.html');
    expect(directoryPath).toContain('ru-hexlet-io_files');
    expect(assetPath.length).toBe(4);
    expect(assetPath).toEqual([
      'ru-hexlet-io-assets-application.css',
      'ru-hexlet-io-assets-professions-nodejs.png',
      'ru-hexlet-io-courses.html',
      'ru-hexlet-io-packs-js-runtime.js',
    ]);
    expect(htmlResult).toEqual(answerFixtureHTml);
    scopeRoot.done();
    scopeHTML.done();
    assetScopes.forEach((scope) => scope.done());
  });

  it('error with non-valid URL', async () => {
    await expect(downloadPage('opa', tmpDir)).rejects.toThrow(urlError);
  });

  it('error with non-valid URL', async () => {
    await expect(downloadPage('opa', tmpDir)).rejects.toThrow(urlError);
  });

  it('500 response status code from url', async () => {
    const pathFixture = getFixturePath(coursesHtmlName);
    const htmlPage = await readFile(pathFixture);
    const scopeHtml = nock(mainDomain).get('/courses').reply(500, htmlPage);

    await expect(axiosGet(url)).rejects.toThrow(serverError);
    scopeHtml.done();
  });
});
