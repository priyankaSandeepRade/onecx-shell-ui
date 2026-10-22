import { createConfig } from '@nx/angular-rspack'
import baseWebpackConfig from './rspack-mf.config'

export default async () => {
  const baseConfig = await createConfig(
    {
      options: {
        root: __dirname,
        // Emit to dist/onecx-shell-ui (not dist/onecx-shell-ui/browser) so the Dockerfile and
        // copy-preloaders.sh, which expect dist/onecx-shell-ui/, keep working.
        outputPath: { base: 'dist', browser: 'onecx-shell-ui' },
        index: './src/index.html',
        browser: './src/main.ts',
        polyfills: ['zone.js'],
        tsConfig: './tsconfig.app.json',
        inlineStyleLanguage: 'scss',
        assets: [
          './src/favicon.ico',
          './src/assets',
          {
            glob: '**/*',
            input: './pre_loaders/angular-18/node_modules/@onecx/portal-integration-angular/assets/',
            output: '/onecx-portal-lib/assets/'
          },
          {
            glob: '**/*',
            input: './node_modules/@onecx/angular-accelerator/assets/',
            output: '/onecx-angular-accelerator/assets/'
          },
          {
            glob: '**/*',
            input: './node_modules/@onecx/angular-utils/assets/',
            output: '/onecx-angular-utils/assets/'
          },
          {
            glob: '**/*',
            input: './node_modules/@onecx/shell-core/assets/',
            output: '/onecx-shell-core/assets/'
          },
          {
            glob: '**/*',
            input: './pre_loaders/angular-18/dist/onecx-angular-18-loader',
            output: '/pre_loaders/onecx-angular-18-loader'
          },
          {
            glob: '**/*',
            input: './pre_loaders/angular-19/dist/onecx-angular-19-loader',
            output: '/pre_loaders/onecx-angular-19-loader'
          },
          {
            glob: '**/*',
            input: './pre_loaders/angular-20/dist/onecx-angular-20-loader',
            output: '/pre_loaders/onecx-angular-20-loader'
          },
          {
            glob: '**/*',
            input: './pre_loaders/angular-21/dist/onecx-angular-21-loader',
            output: '/pre_loaders/onecx-angular-21-loader'
          },
          {
            glob: '**/*',
            input: './pre_loaders/react-19/dist/onecx-react-19-loader',
            output: '/pre_loaders/onecx-react-19-loader'
          }
        ],
        styles: [
          { input: './src/splash.scss', inject: true },
          { input: './src/global-styles.scss', bundleName: 'global-styles', inject: true },
          { input: './src/shell-styles.scss', bundleName: 'shell-styles', inject: false },
          { input: './src/portal-layout-styles.scss', bundleName: 'portal-layout-styles', inject: false }
        ],
        sourceMap: { scripts: true, styles: false, vendor: true, hidden: false },
        scripts: [],
        devServer: { hmr: false, port: 4300, proxyConfig: './proxy.conf.js' }
      }
    },
    {
      production: {
        options: {
          budgets: [
            { type: 'initial', maximumWarning: '1mb', maximumError: '5mb' },
            { type: 'anyComponentStyle', maximumWarning: '2kb', maximumError: '4kb' }
          ],
          sourceMap: { scripts: true, styles: false, vendor: true, hidden: false },
          outputHashing: 'all',
          // The webpack-based license-webpack-plugin bundled by @nx/angular-rspack cannot enumerate
          // Rspack's virtual module directories (it calls readdirSync('')), so 3rdpartylicenses.txt
          // extraction is disabled for the Rspack build, matching the development configuration.
          extractLicenses: false,
          devServer: {}
        }
      },
      development: {
        options: {
          optimization: false,
          vendorChunk: true,
          extractLicenses: false,
          sourceMap: true,
          namedChunks: true,
          devServer: {}
        }
      },
      'local-env': {
        options: {
          baseHref: '/onecx-shell/',
          outputHashing: 'all',
          devServer: {
            host: '0.0.0.0',
            disableHostCheck: true,
            publicHost: 'http://localhost:4300/onecx-shell/',
            port: 4300,
            // local-env is served under the /onecx-shell/ prefix, so it proxies the prefixed
            // /onecx-shell/shell-bff path (proxy.local-env.conf.js) rather than /shell-bff.
            proxyConfig: './proxy.local-env.conf.js'
          }
        }
      }
    }
  )
  const oldConfig = await baseWebpackConfig
  const browserConfig = baseConfig[0]
  return oldConfig(browserConfig)
}
