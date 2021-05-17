#!/usr/bin/env node

import { program } from 'commander';
import { config } from 'dotenv';
import downloadFile from '../src/downloadPage';

config();

try {
  program
    .version('0.0.1', '-v, --version', 'output the current version')
    .arguments('<url>')
    .option('--output [dirPath]', 'directory for output file', process.cwd())
    .action(async (url) => {
      const opts = program.opts();
      const dirPath = opts.output;
      try {
        await downloadFile(url, dirPath);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    })
    .parse(process.argv);
} catch (e) {
  console.error(e);
}
