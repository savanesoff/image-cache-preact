// detect if
const host = location.hostname || 'localhost';
const images = {
  big: 'test-4k.jpg',
  small: 'test-small.png',
  tiny: 'movie-poster-155x210.jpg',
};
export const config = {
  image: {
    baseUrl: `http://${host}:8080/${images.big}`,
    mimeType: 'image/png',
    colorType: 'RGBA',
    renderWidth: 155,
    renderHeight: 210,
  },

  topics: 2,
  perPage: 10,
  pages: 10,
  visibilityMargin: '500px',
};
