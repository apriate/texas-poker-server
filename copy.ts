import * as shelljs from 'shelljs';
shelljs.cp('-R', '.env.development', 'dist');
shelljs.cp('-R', '.env.production', 'dist');
