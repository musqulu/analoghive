// This Babel configuration is ONLY used for Jest tests
// It is not used by Next.js for development or production builds
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
}; 