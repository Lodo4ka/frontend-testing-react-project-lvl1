import { Command } from 'commander';
import downloadFile from './downloadFile';


export default () => {
  const program = new Command();

  program
    .version('0.0.1', '-v, --version', 'output the current version')
    .arguments('<url>')
    .option('--output [dirPath]', 'directory for output file')
    .action(async (url) => {
      const opts = program.opts();
      const dirPath = opts.output;
      await downloadFile(url, dirPath);
    })
    .parse(process.argv)
    .opts();
};
