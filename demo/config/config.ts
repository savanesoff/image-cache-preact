import small from '@demo/assets/155x210.jpg';
import med from '@demo/assets/1920x1092.png';
import big from '@demo/assets/4k.jpg';

export const config = {
  image: {
    baseUrl: med,
    mimeType: 'image/png',
    colorType: 'RGBA',
    renderWidth: 155,
    renderHeight: 210,
  },
  images: {
    small: {
      url: small,
      width: 155,
      height: 210,
    },
    medium: {
      url: med,
      width: 1920,
      height: 1092,
    },
    large: {
      url: big,
      width: 3840,
      height: 2184,
    },
  },

  topics: 4,
  perPage: 20,
  pages: 4,
  visibilityMargin: '500px',
};
