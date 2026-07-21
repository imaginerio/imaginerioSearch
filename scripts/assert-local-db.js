#!/usr/bin/env node
/**
 * Preflight guard for destructive database commands.
 *
 * `db:migrate:undo:all` runs every migration's down() and drops the whole
 * schema. The connection it targets is implicit: config/config.js picks a block
 * by NODE_ENV, and the `development` block reads DB_URL. On any machine where
 * DB_URL points at production -- a Render shell, or a developer .env copied from
 * a deployed service -- a command that looks local would wipe production.
 *
 * This script resolves the exact same URL the command is about to use and
 * refuses unless that database is disposable. It is wired only to the two
 * destructive scripts (`test`, `db:migrate:reset`); forward-only `db:migrate`
 * and `db:job` must keep working against production and are left alone.
 *
 * Exits 0 to allow, 1 to abort. Never prints the connection string, which
 * carries credentials.
 */

const OVERRIDE = 'ALLOW_DESTRUCTIVE_DB';

// Hosts that can only mean "this machine". A leading "/" is a unix-socket
// directory, which is likewise local. Note that host.docker.internal is
// deliberately absent: it is a different network stack from this process, and
// the devcontainer uses network_mode: service:db so Postgres is on localhost.
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];
const LOOPBACK = /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

const label = process.argv[2] || 'test';

const abort = message => {
  process.stderr.write(`\n  Refusing to run a destructive database command.\n\n${message}\n\n`);
  process.exit(1);
};

// Snapshot the override from the REAL environment before requiring the config,
// which calls dotenv.config(). Otherwise a line in a committed-by-accident .env
// would permanently unlock the production database with no output at all.
const overrideValue = process.env[OVERRIDE];

// The same file, and therefore the same dotenv load and precedence, that
// .sequelizerc hands to sequelize-cli a moment later. If this throws, the
// non-zero exit stops the destructive command that would have followed.
const configs = require('../config/config');

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

if (!config) {
  abort(
    `  NODE_ENV is "${env}", which is not one of the environments defined in\n` +
      `  config/config.js (development, test, production). Fix NODE_ENV and retry.`
  );
}

// Not overridable: nothing destructive is ever legitimate under production.
if (env === 'production') {
  abort(
    `  NODE_ENV is "production", and yarn ${label} drops every table.\n` +
      `  There is no override for this. Run it against a local database instead.`
  );
}

if (!config.url) {
  abort(
    `  No database URL is configured for NODE_ENV=${env}.\n` +
      `  Set TEST_DB_URL (for tests) or DB_URL, then try again.`
  );
}

let parsed;
try {
  parsed = new URL(config.url);
} catch (err) {
  // Fail closed: if we cannot tell what this points at, we do not drop it.
  abort(`  Could not parse the ${env} database URL, so it cannot be verified as local.`);
}

let database;
try {
  database = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
} catch (err) {
  // A stray percent sign makes decodeURIComponent throw; abort cleanly rather
  // than exiting on an uncaught URIError stack trace.
  abort(`  The ${env} database URL has a malformed database name, so it cannot be verified.`);
}
if (!database) {
  abort(`  The ${env} database URL names no database, so it cannot be verified.`);
}

// db:migrate:reset never reads TEST_DB_URL, so pointing the operator at it
// would send them to change the wrong variable.
const remedy =
  env === 'test'
    ? `  To reset a local test database, point TEST_DB_URL at it, for example:\n\n` +
      `    TEST_DB_URL=postgresql://postgres:postgres@127.0.0.1/imagineriotest yarn ${label}`
    : `  To reset a local database, point DB_URL at it, for example:\n\n` +
      `    DB_URL=postgresql://postgres:postgres@127.0.0.1/imagineriosearch yarn ${label}`;

// Two parsers decide the effective host and they disagree: sequelize-cli reads
// the URL authority and ignores query params, while Sequelize/pg let "?host="
// override it. Require every candidate to be local, so whichever wins is safe.
// getAll, not get: pg uses the LAST duplicate ?host=, so checking only the
// first would let "?host=127.0.0.1&host=prod" through.
const normalize = host => host.replace(/^\[|\]$/g, '').toLowerCase();
const named = [...parsed.searchParams.getAll('host'), parsed.hostname].filter(
  host => typeof host === 'string' && host !== ''
);
// No host anywhere in the URL: libpq falls back to PGHOST, then to a socket.
const hosts = (named.length > 0 ? named : [process.env.PGHOST || '/tmp']).map(normalize);

const isLocal = host => host.startsWith('/') || LOCAL_HOSTS.includes(host) || LOOPBACK.test(host);
const remote = hosts.filter(host => !isLocal(host));

// The escape hatch must name the database exactly, so it cannot be blanket-set
// to "1" in a .env or an env group and silently cover a later change of DB_URL.
const overridden = overrideValue === database;

// Never let the override pass silently -- an unnoticed override is how it stops
// being a deliberate act and starts being ambient configuration.
if (overridden) {
  process.stderr.write(
    `\n  WARNING: ${OVERRIDE} is set, so the usual safety checks are skipped.\n` +
      `  About to drop every table in "${database}" on ${hosts.join(', ')}.\n\n`
  );
}

if (remote.length > 0 && !overridden) {
  abort(
    `  yarn ${label} drops every table, and the database it resolved to is not local.\n\n` +
      `    NODE_ENV : ${env}\n` +
      `    host     : ${remote[0]}\n` +
      `    database : ${database}\n\n` +
      `  Only a database on this machine may be dropped.\n\n` +
      `${remedy}\n\n` +
      `  If you genuinely intend to destroy this remote database, name it exactly:\n\n` +
      `    ${OVERRIDE}=${database} yarn ${label}`
  );
}

if (env === 'test' && !/test/i.test(database) && !overridden) {
  abort(
    `  NODE_ENV is "test", but the database yarn ${label} would drop is named\n` +
      `  "${database}", which does not look like a test database.\n\n` +
      `${remedy}\n\n` +
      `  Or, to drop "${database}" anyway:\n\n` +
      `    ${OVERRIDE}=${database} yarn ${label}`
  );
}
