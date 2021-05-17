#!/usr/bin/env node

import program from 'commander';
import { config } from 'dotenv';
import downloadPage from '../src';

config();

program
  .description('download all sources from source page')
  .version('1.0.0', '-v, --version', 'output the current version')
  .arguments('<url>')
  .option('-o --output [dirPath]', 'directory for output file', process.cwd())
  .action(async (url) => {
    const opts = program.opts();
    const dirPath = opts.output;
    try {
      await downloadPage(url, dirPath);
      console.log('page has been downloaded');
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  })
  .parse(process.argv);
