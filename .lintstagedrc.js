/** @type {import('lint-staged').Config} */
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*{json,md,yml,yaml}': ['prettier --write'],
};
bW9kdWxlLmV4cG9ydHMgPSB7CiAgJyoue2pzLGpzeCx0cyx0c3h9JzogKGN3ZCkgPT4gWwogICAgYCR7Y3dkfS9ub2RlX21vZHVsZXMvLmJpbi9lc2xpbnQgLS1maXggJHtj d2R9L2FwcHMvd2ViLyR7Y3dkfSIsCiAgXSwKfTsK