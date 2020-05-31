import * as functions from 'firebase-functions';
import * as os from 'os';
import * as path from 'path';
import * as gs from 'gs';
import { spawn } from 'child-process-promise';
import { unlink as unlinkCb } from 'fs';
import { firebase } from '../helpers/firebase';

const execGs = (gsInstance: any) =>
  new Promise((resolve, reject) =>
    gsInstance.exec((error: Error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }),
  );

const unlink = (path: string) =>
  new Promise((resolve, reject) =>
    unlinkCb(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }),
  );

const bucketName = functions.config().ancillas.bucket;

export const processAncilla = functions
  .region('europe-west3')
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB',
  })
  .storage.bucket(bucketName)
  .object()
  .onFinalize(async (object) => {
    if (!object.name || !/^raw\/.+\.pdf$/.test(object.name)) {
      console.info('Uploaded file is not an Ancilla Domini, ignoring it.');
      return;
    }

    const bucket = firebase.storage().bucket(bucketName);
    const ancillaName = path.basename(object.name, '.pdf');
    const tmpFileIn = path.resolve(os.tmpdir(), `${ancillaName}_raw.pdf`);
    const tmpFileOut = path.resolve(os.tmpdir(), `${ancillaName}.pdf`);
    const tmpThumbnailOut = path.resolve(os.tmpdir(), `${ancillaName}.jpg`);

    console.info('Downloading the input PDF file...');

    await bucket.file(object.name).download({
      destination: tmpFileIn,
    });

    await Promise.all([
      new Promise(async (resolve) => {
        console.info('Shrinking the PDF file size...');

        await execGs(
          gs()
            .batch()
            .nopause()
            .q()
            .device('pdfwrite')
            .executablePath('lambda-ghostscript/bin/gs')
            .option('-sDEVICE=pdfwrite')
            .option('-dPDFSETTINGS=/screen')
            .option('-dColorImageDownsampleType=/Bicubic')
            .option('-dColorImageResolution=72')
            .option('-dGrayImageDownsampleType=/Bicubic')
            .option('-dGrayImageResolution=72')
            .option('-dMonoImageDownsampleType=/Bicubic')
            .option('-dMonoImageResolution=72')
            .option('-dPrinted=false')
            .input(tmpFileIn)
            .output(tmpFileOut),
        );

        console.info('Uploading the shrinked PDF...');

        await bucket.upload(tmpFileOut, {
          destination: `processed/${ancillaName}.pdf`,
        });

        await unlink(tmpFileOut);

        console.info('PDF shrinked successfully.');

        resolve();
      }),
      new Promise(async (resolve) => {
        console.info('Converting the first page of the PDF into an image...');

        await execGs(
          gs()
            .batch()
            .nopause()
            .q()
            .device('jpeg')
            .executablePath('lambda-ghostscript/bin/gs')
            .option('-dTextAlphaBits=4')
            .option('-dFirstPage=1')
            .option('-dLastPage=1')
            .res(72)
            .input(tmpFileIn)
            .output(tmpThumbnailOut),
        );

        console.info('Resizing the image into a thumbnail...');

        const mogrifyProcess = await spawn(
          'mogrify',
          [
            '-format',
            'jpg',
            '-resize',
            '340x480',
            '-limit',
            'area',
            '256MB',
            '-limit',
            'memory',
            '256MB',
            '-limit',
            'map',
            '512MB',
            `${ancillaName}.jpg`,
          ],
          {
            capture: ['stdout', 'stderr'],
            cwd: os.tmpdir(),
          },
        );

        mogrifyProcess.childProcess.kill();

        console.info('Uploading the generated thumbnail...');

        await bucket.upload(tmpThumbnailOut, {
          destination: `processed/${ancillaName}.jpg`,
        });

        await unlink(tmpThumbnailOut);

        console.info('Thumbnail generated successfully.');

        resolve();
      }),
    ]);

    await unlink(tmpFileIn);

    console.info('Done!');
  });
