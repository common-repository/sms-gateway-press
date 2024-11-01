const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/js/Dashboard.jsx'],
  bundle: true,
  outfile: 'dist/js/dashboard.js',
  minify: true,
  sourcemap: true,
  loader: {
    '.svg': 'dataurl',
  }
}).catch(() => process.exit(1));

esbuild.build({
  entryPoints: ['src/js/wizard-app.jsx'],
  bundle: true,
  outfile: 'dist/js/wizard.js',
  minify: true,
  sourcemap: true,
  loader: {
    '.svg': 'dataurl',
  }
}).catch(() => process.exit(1));
