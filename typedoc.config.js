const { version } = require('./package.json');

module.exports = {
  entryPoints: ['./src/index.ts'],
  out: 'docs',
  githubPages: false,
  gitRevision: version,
  readme: './README-docs.md'
};
