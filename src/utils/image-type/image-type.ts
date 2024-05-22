export type ImageType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/tiff'
  | 'image/bmp'
  | 'image/webp'
  | 'image/svg+xml'
  | 'image/vnd.microsoft.icon'
  | 'image/heic';

export const getImageType = (blob: Blob): Promise<ImageType> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function (e: ProgressEvent<FileReader>) {
      if (e.target && e.target.readyState === FileReader.DONE) {
        const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(
          0,
          12, // Read the first 12 bytes
        );
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16).padStart(2, '0'); // Ensure each byte is 2 characters long
        }
        switch (true) {
          case /^89504e47/.test(header):
            resolve('image/png');
            break;
          case /^47494638/.test(header):
            resolve('image/gif');
            break;
          case /^ffd8ffe/.test(header):
            resolve('image/jpeg');
            break;
          case /^49492a00/.test(header):
          case /^4d4d002a/.test(header):
            resolve('image/tiff');
            break;
          case /^424d/.test(header):
            resolve('image/bmp');
            break;
          case /^52494646[0-9a-f]{16}/.test(header):
            resolve('image/webp');
            break;
          case /^3c3f786d6c20/.test(header):
          case /^3c73766720/.test(header):
            resolve('image/svg+xml');
            break;
          case /^00000100/.test(header):
            resolve('image/vnd.microsoft.icon');
            break;
          case /^6674797068656963/.test(header):
            resolve('image/heic');
            break;
          default:
            reject('Unknown image type');
        }
      }
    };
    reader.readAsArrayBuffer(blob.slice(0, 4));
  });
};
