#!/usr/bin/env node

import program from 'commander';
import downloadPage from '../src/index.js';

program
  .description('download all sources from source page')
  .version('1.0.0', '-v, --version', 'output the current version')
  .arguments('<url>')
  .option('-o --output [dirPath]', 'directory for output file', process.cwd())
  .action(async (url) => {
    const opts = program.opts();
    const dirPath = opts.output;
    await downloadPage(url, dirPath);
    console.log('page has been downloaded');
  })
  .parse(process.argv);
