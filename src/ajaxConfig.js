import axios from 'axios';
import { addLogger } from 'axios-debug-log';
import debug from 'debug';

const ajaxConfig = axios.create();
const ajaxLogger = debug('page-loader');
addLogger(ajaxConfig, ajaxLogger);

export default ajaxConfig;
