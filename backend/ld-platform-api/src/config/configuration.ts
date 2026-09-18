export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
});
