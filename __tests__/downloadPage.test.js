import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';

import downloadPage from '../src/index.js';

const readFile = async (pathName) => fs.readFile(pathName, 'utf-8');
const readFixture = async (pathFixture) => readFile(path.join(__dirname, '..', '__fixtures__', pathFixture));

describe('download page and save in tmp directory', () => {
  let tmpDir;
  beforeAll(async () => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  test('download page from  https://site.com', async () => {
    const htmlPage = await readFixture('site-com-blog-about.html');
    const jpg = await readFixture('site-com-photos-me.jpg');
    const css = await readFixture('site-com-blog-about-assets-styles.css');
    const js = await readFixture('site-com-assets-scripts.js');
    const htmlAnswer = await readFixture('/expected/site-com-blog-about.html');
    nock('https://site.com')
      .get('/blog/about')
      .reply(200, htmlPage)
      .get('/blog/about')
      .reply(200, htmlPage)
      .get('/photos/me.jpg')
      .reply(200, jpg)
      .get('/assets/scripts.js')
      .reply(200, js)
      .get('/blog/about/assets/styles.css')
      .reply(200, css);
    await downloadPage('https://site.com/blog/about', tmpDir);
    const result = await readFile(path.join(tmpDir, 'site-com-blog-about.html'));
    const directory = await fs.readdir(tmpDir);
    const directoryAsset = await fs.readdir(path.join(tmpDir, 'site-com-blog-about_files'));
    expect(result).toEqual(htmlAnswer);
    expect(directory).toContain('site-com-blog-about.html');
    expect(directory).toContain('site-com-blog-about_files');
    expect(directoryAsset).toContain('site-com-photos-me.jpg');
    expect(directoryAsset).toContain('site-com-blog-about-assets-styles.css');
    expect(directoryAsset).toContain('site-com-blog-about.html');
    expect(directoryAsset).toContain('site-com-assets-scripts.js');
  });

  // test('download page from  https://site.com', async () => {
  //   const htmlPage = await readFixture('site-com-blog-about.html');
  //   const jpg = await readFixture('site-com-photos-me.jpg');
  //   const css = await readFixture('site-com-blog-about-assets-styles.css');
  //   const js = await readFixture('site-com-assets-scripts.js');
  //   const htmlAnswer = await readFixture('/expected/site-com-blog-about.html');
  //   nock('https://site.com')
  //     .get('/blog/about')
  //     .reply(200, htmlPage)
  //     .get('/blog/about')
  //     .reply(200, htmlPage)
  //     .get('/photos/me.jpg')
  //     .reply(200, jpg)
  //     .get('/assets/scripts.js')
  //     .reply(200, js)
  //     .get('/blog/about/assets/styles.css')
  //     .reply(200, css);
  //   await downloadPage('https://site.com/blog/about', tmpDir);
  //   const result = await readFile(path.join(tmpDir, 'site-com-blog-about.html'));
  //   expect(result).toEqual(htmlAnswer);
  // });
});
