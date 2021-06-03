import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';
import {
  describe, it, expect, beforeEach, afterAll, beforeAll,
} from '@jest/globals';

import downloadPage from '../src/index';

describe('download page and save in tmp directory', () => {
  const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
  const readFile = async (pathName) => fs.readFile(pathName, 'utf-8');
  const readFileBinary = async (pathName) => fs.readFile(pathName, 'binary');

  const url = 'https://ru.hexlet.io/courses';
  const urlRoot = 'https://ru.hexlet.io';
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

    await expect(downloadPage(url, tmpDir)).resolves.not.toThrow();

    await expect(fs.access(path.join(tmpDir, htmlCoursesname))).resolves.not.toThrow();
    const directoryPath = await fs.readdir(tmpDir);
    const assetPath = await fs.readdir(assetDir);
    const htmlResult = await readFile(path.join(tmpDir, htmlCoursesname));

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
      '/photos/me.jpg',
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
    const scopeBlogAbout = nock(mainDomain).get('/blog/about').reply(200, htmlPageCourses);

    await expect(downloadPage(urlRoot, tmpDir)).resolves.not.toThrow();
    await expect(fs.access(path.join(tmpDir, 'ru-hexlet-io.html'))).resolves.not.toThrow();
    const directoryPath = await fs.readdir(tmpDir);
    const assetPath = await fs.readdir(rootAssetDir);
    const htmlResult = await readFile(path.join(tmpDir, 'ru-hexlet-io.html'));
    expect(directoryPath).toContain('ru-hexlet-io.html');
    expect(assetPath.length).toBe(6);
    expect(assetPath).toEqual([
      'ru-hexlet-io-assets-application.css',
      'ru-hexlet-io-assets-professions-nodejs.png',
      'ru-hexlet-io-blog-about.html',
      'ru-hexlet-io-courses.html',
      'ru-hexlet-io-packs-js-runtime.js',
      'ru-hexlet-io-photos-me.jpg',
    ]);
    expect(htmlResult).toEqual(answerFixtureHTml);
    scopeRoot.done();
    scopeHTML.done();
    scopeBlogAbout.done();
    assetScopes.forEach((scope) => scope.done());
  });
});
