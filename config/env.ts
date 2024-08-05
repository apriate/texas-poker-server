import * as fs from 'fs';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production';

function parseEnv() {
  const localEnv = path.resolve('.env');
  const prodEnv = path.join(__dirname, '..', '/.env.prod');
  console.log('XXX --- XXX: process.env.NODE_ENV', process.env.NODE_ENV);
  console.log('XXX --- XXX: localEnv', localEnv);
  console.log('XXX --- XXX: prodEnv', prodEnv);
  console.log('XXX --- XXX: isProd', isProd);

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error('缺少环境配置文件');
  }

  const filePath = !isProd && fs.existsSync(localEnv) ? localEnv : prodEnv;
  return { path: filePath };
}
export default parseEnv();
