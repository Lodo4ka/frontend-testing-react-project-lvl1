import { Command } from 'commander';
import { config } from 'dotenv';
import downloadFile from './downloadPage';

export default () => {
  const program = new Command();

  config();

  try {
    program
      .version('0.0.1', '-v, --version', 'output the current version')
      .arguments('<url>')
      .option('--output [dirPath]', 'directory for output file', process.cwd())
      .action(async (url) => {
        const opts = program.opts();
        const dirPath = opts.output;
        await downloadFile(url, dirPath);
      })
      .parse(process.argv)
      .opts();
  } catch (e) {
    console.log('error');
  }
};
