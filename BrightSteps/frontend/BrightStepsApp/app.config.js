const appJson = require('./app.json');

module.exports = ({ config }) => {
  const baseConfig = config ?? appJson.expo ?? {};
  const projectId = process.env.EXPO_PROJECT_ID;

  if (!projectId) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    extra: {
      ...(baseConfig.extra || {}),
      eas: {
        ...((baseConfig.extra && baseConfig.extra.eas) || {}),
        projectId,
      },
    },
  };
};
