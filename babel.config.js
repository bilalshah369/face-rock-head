// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
// };

// module.exports = {
//   presets: ['module:metro-react-native-babel-preset'],
//   plugins: ['react-native-reanimated/plugin'],
// };
// module.exports = {
//   presets: ['module:metro-react-native-babel-preset'],
//   plugins: [
//     ['@babel/plugin-transform-private-methods', {loose: true}],
//     'react-native-reanimated/plugin', // MUST be last
//   ],
// };
module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
      },
    ],
    ['@babel/plugin-transform-private-methods', {loose: true}],
    'react-native-reanimated/plugin', // MUST be last
  ],
};
