import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';

import {
  describe, it, expect, beforeEach, afterEach,
} from '@jest/globals';
import downloadFile from '../src/downloadPage';
import createHTMLName from '../src/createHTMLName';
import createDirectoryName from '../src/createDirectoryName';
import createFileName from '../src/createFileName';

describe('download page and save in tmp directory', () => {
  const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
  const readFile = async (pathName) => fs.readFile(pathName, 'utf-8');

  const url = 'https://ru.hexlet.io/courses';
  const urlCourses = 'https://ru.hexlet.io/programs';
  const coursesHtmlName = 'ru-hexlet-io-courses.html';
  const programHtmlName = 'ru-hexlet-io-programs.html';
  const formattedFile = 'ru-hexlet-io-courses.html';
  const directoryName = 'ru-hexlet-io-courses_files';
  const directoryAssetName = 'ru-hexlet-io-programs_files';
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  it('create file name by html extension', () => {
    const result = createHTMLName(url);
    expect(result).toBe(coursesHtmlName);
  });

  it('create directory name by file name', () => {
    const result = createDirectoryName(url);
    expect(result).toBe(directoryName);
  });

  it('create png name by self name and host name', () => {
    const pngURl = 'https://cdn2.hexlet.io/assets/professions/program-f26fba51e364abcd7f15475edb68d93958426d54c75468dc5bc65e493a586226.png';
    const pngName = 'ru-hexlet-io-assets-professions-program-f26fba51e364abcd7f15475edb68d93958426d54c75468dc5bc65e493a586226.png';
    const result = createFileName(pngURl, url);
    expect(result).toBe(pngName);
  });

  it('download html plain from url', async () => {
    await downloadFile(url, tmpDir);
    const directoryPath = await fs.readdir(tmpDir);
    expect(directoryPath).toContain(formattedFile);
  });

  it('download all imgs from url', async () => {
    await downloadFile(urlCourses, tmpDir);
    const assetDir = path.join(tmpDir, directoryAssetName);
    const resultPath = await fs.readdir(tmpDir);
    const dirAssets = await fs.readdir(assetDir);
    expect(resultPath).toContain(programHtmlName);
    expect(resultPath).toContain(directoryAssetName);
    expect(dirAssets.length).toBeGreaterThan(1);
  });
});
