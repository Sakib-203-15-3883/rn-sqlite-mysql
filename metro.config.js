const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Get the default Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

// Customize or extend the default configuration if needed
const customConfig = {
  // Any custom configurations you want to add
};

// Merge default and custom configurations
const mergedConfig = mergeConfig(defaultConfig, customConfig);

// Wrap the merged configuration with Reanimated's wrapper
module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
