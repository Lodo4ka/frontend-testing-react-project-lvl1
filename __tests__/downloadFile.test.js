import { describe, it, expect } from '@jest/globals';
import downloadFile from '../src/downloadFile';
import formatterPath from '../src/formatterPath';

describe('download page and save in tmp directory', () => {
  const url = 'https://ru.hexlet.io/courses';
  // it('download all content from url', async () => {
  //   const formattedUrl = 'ru-hexlet-io-courses.html';
  //   const data = await downloadFile(url);
  // });
  //
  //
  it('format file path with html extension', () => {
    const formattedUrl = 'ru-hexlet-io-courses.html';
    const result = formatterPath(url);
    expect(result).toBe(formattedUrl);
  });
});
