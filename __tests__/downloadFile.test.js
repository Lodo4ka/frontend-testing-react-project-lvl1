import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';

import {
  describe, it, expect, beforeEach,
} from '@jest/globals';
import downloadFile from '../src/downloadFile';
import formatterPath from '../src/formatterPath';

describe('download page and save in tmp directory', () => {
  const url = 'https://ru.hexlet.io/courses';
  const formattedFile = 'ru-hexlet-io-courses.html';
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  it('format file path with html extension', () => {
    const result = formatterPath(url);
    expect(result).toBe(formattedFile);
  });

  it('download html from url', async () => {
    await downloadFile(url, tmpDir);
    const directoryPath = await fs.readdir(tmpDir);
    expect(directoryPath).toContain(formattedFile);
  });
});
