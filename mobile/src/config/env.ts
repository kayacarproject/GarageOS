const ENV = {
  dev: {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    USE_DUMMY_DATA: true,
  },
  prod: {
    API_BASE_URL: 'https://api.garageos.in/v1',
    USE_DUMMY_DATA: true,
  },
};

const getEnv = () => {
  if (__DEV__) return ENV.dev;
  return ENV.prod;
};

export default getEnv();
