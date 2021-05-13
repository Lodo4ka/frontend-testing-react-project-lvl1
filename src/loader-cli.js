import { Command } from 'commander';
import { config } from 'dotenv';
import downloadFile from './downloadPage';

export default () => {
  const program = new Command();

  config();

  program
    .version('0.0.1', '-v, --version', 'output the current version')
    .arguments('<url>')
    .option('--output [dirPath]', 'directory for output file', process.cwd())
    .action(async (url) => {
      const opts = program.opts();
      const dirPath = opts.output;
      await downloadFile(url, dirPath);
    })
    .configureOutput({
      writeErr(str) {
        console.error(str);
        process.exit(0);
      },
    })
    .parse(process.argv)
    .opts();
};
