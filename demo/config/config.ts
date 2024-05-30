// detect if
const host = location.hostname || 'localhost';
const images = {
  big: 'test-4k.jpg',
  small: 'test-small.png',
  tiny: 'movie-poster-155x210.jpg',
};
export const config = {
  image: {
    baseUrl: `http://${host}:8080/${images.small}`,
    mimeType: 'image/png',
    colorType: 'RGBA',
    renderWidth: 155,
    renderHeight: 210,
  },

  topics: 1,
  perPage: 10,
  pages: 4,
  visibilityMargin: '500px',
};
