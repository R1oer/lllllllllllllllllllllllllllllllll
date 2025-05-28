const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  zlib: require.resolve('browserify-zlib'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  net: require.resolve('node-libs-browser/mock/net'),
  tls: require.resolve('node-libs-browser/mock/tls'),
  fs: require.resolve('node-libs-browser/mock/empty'),
  path: require.resolve('path-browserify'),
  crypto: require.resolve('crypto-browserify')
};

module.exports = config; 