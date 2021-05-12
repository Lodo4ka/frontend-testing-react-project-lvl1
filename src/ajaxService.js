import axios from 'axios';
import { addLogger } from 'axios-debug-log';
import debug from 'debug';

const ajaxService = axios.create();
const ajaxLogger = debug('page-loader');
addLogger(ajaxService, ajaxLogger);

export default ajaxService;
