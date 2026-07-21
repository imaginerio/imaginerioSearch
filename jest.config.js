module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).js'],
  // .claude/ holds git worktrees, each carrying a second copy of every test
  // file. Running both copies against the same database made two suites create
  // the same uniquely-named fixtures concurrently, and the loser left rows
  // behind that broke every later run.
  //
  // Anchored to <rootDir> on purpose: a bare '/\.claude/' also matches when the
  // checkout itself lives under .claude/ (which is exactly where those worktrees
  // are), silently reducing a run inside one to zero tests.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/\\.claude/'],
  forceExit: true,
  testTimeout: 30000,
};
