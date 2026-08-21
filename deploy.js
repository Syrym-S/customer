import dotenv from 'dotenv';
import FtpDeploy from 'ftp-deploy';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: '.env.ftp' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const credentials = {
   user: process.env.FTP_USER,
   password: process.env.FTP_PASSWORD,
   host: process.env.FTP_HOST,
   port: parseInt(process.env.FTP_PORT || '21', 10),
   deleteRemote: false,
};

// Two separate remote destinations on the same FTP server/credentials:
// - main app (dist/index.js, dist/index.css, dist/vite.svg) -> FTP_REMOTE_ROOT
// - public shared-lead bundle (dist/shared/**) -> FTP_REMOTE_ROOT_PUBLIC, a
//   flat sibling path (js/shared/), not nested under FTP_REMOTE_ROOT (see
//   vite.config.public.js for where dist/shared/index.js etc. come from).
const deployTargets = [
   {
      label: 'main app',
      config: {
         ...credentials,
         localRoot: join(__dirname, 'dist'),
         remoteRoot: process.env.FTP_REMOTE_ROOT,
         include: ['*', '**/*'],
         exclude: ['shared/**'],
      },
   },
   {
      label: 'public shared-lead bundle',
      config: {
         ...credentials,
         localRoot: join(__dirname, 'dist', 'shared'),
         remoteRoot: process.env.FTP_REMOTE_ROOT_PUBLIC,
         include: ['*', '**/*'],
      },
   },
];

async function deployAll() {
   // Sequential, not parallel — each deploy opens its own FTP session against
   // the same host/credentials, so running them one after another avoids any
   // risk of two concurrent sessions interfering with each other.
   for (const target of deployTargets) {
      console.log(
         `Uploading ${target.label} (${target.config.localRoot} -> ${target.config.remoteRoot})...`,
      );

      try {
         await new FtpDeploy().deploy(target.config);
         console.log(`Uploaded ${target.label} successfully.`);
      } catch (err) {
         console.error(`Failed to upload ${target.label}:`, err);
         process.exitCode = 1;
         return;
      }
   }

   console.log('Upload complete');
}

deployAll();
