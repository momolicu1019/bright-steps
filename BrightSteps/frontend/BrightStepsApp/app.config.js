const appJson = require('./app.json');

module.exports = ({ config }) => {
  const baseConfig = config ?? appJson.expo ?? {};
  const projectId = process.env.EXPO_PROJECT_ID;
  const ownerOverride = process.env.EXPO_OWNER;

  if (!projectId) {
    if (!ownerOverride) {
      return baseConfig;
    }

    return {
      ...baseConfig,
      owner: ownerOverride,
    };
  }

  const withProjectId = {
    ...baseConfig,
    ...(ownerOverride ? { owner: ownerOverride } : {}),
    extra: {
      ...(baseConfig.extra || {}),
      eas: {
        ...((baseConfig.extra && baseConfig.extra.eas) || {}),
        projectId,
      },
    },
  };

  if (ownerOverride) {
    return withProjectId;
  }

  // If projectId is supplied by CI but owner is not, drop static owner to avoid mismatch.
  const { owner, ...withoutOwner } = withProjectId;
  return withoutOwner;
};
