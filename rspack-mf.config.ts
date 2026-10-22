import type { Configuration } from '@rspack/core'
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import { getOneCXSharedLibraryConfig } from '@onecx/accelerator'
import mfConfig from './module-federation.config'

// Post-processing for the Rspack base config produced by `@nx/angular-rspack`. It wires up the
// direct `@module-federation/enhanced/rspack` configuration and the source-string loader that
// replaces the webpack-only `ModifySourcePlugin` patches. This is the Rspack equivalent of the
// previous `customWebpackConfig` (`webpack.config.ts`) — the filename was changed because it no
// longer produces a Webpack configuration.

// `mfConfig.name` ("onecx-shell-ui") is the container's output name. The Module Federation container
// name is normalized to a valid JS identifier ("onecx_shell_ui"), which is what consumers look up at
// runtime (e.g. the about page via __FEDERATION__) — mirroring the previous Nx ModuleFederationPlugin.
const mfContainerName = mfConfig.name.replace(/[^a-zA-Z0-9_$]/g, '_')

// The `shared` dependencies are reconstructed by hand: Nx tooling does not carry over the module
// federation `shared` when moving to a direct @module-federation/enhanced/rspack config.
// getOneCXSharedLibraryConfig resolves the OneCX-recommended shared entries (main package +
// sub-packages) for every root dependency, matching what the project-graph auto-discovery produced.
const shellPackage = require('./package.json')
const shared = getOneCXSharedLibraryConfig(shellPackage.dependencies, true)

// The two PrimeNG / Angular SharedStylesHost source patches, previously applied by
// ModifySourcePlugin, are preserved as a Rspack source-string loader.
const sourcePatchLoader = require.resolve('./rspack-source-patch-loader')

export default async function (baseConfig: Configuration): Promise<Configuration> {
  const config = baseConfig

  // Apply the shared-source element patches (PrimeNG + SharedStylesHost) to node_modules JS.
  config.module = {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []),
      {
        test: /\.m?js$/,
        include: /node_modules/,
        enforce: 'pre',
        use: [{ loader: sourcePatchLoader }]
      }
    ]
  }

  // The two source patches rely on the global `this` (a non-ESM module context), so keep the JS
  // parser out of strict ESM mode.
  config.module.parser = {
    ...config.module.parser,
    javascript: { ...config.module.parser?.javascript, importMeta: false }
  }

  config.output = {
    ...config.output,
    uniqueName: mfConfig.name,
    publicPath: 'auto'
  }

  // The shell is a container (it exposes OneCXShellToastComponent), so it must ship its own runtime
  // rather than relying on a shared one.
  config.optimization = {
    ...config.optimization,
    runtimeChunk: false
  }

  // Ensure the workspace root is resolvable so exposed paths like "src/app/..." resolve.
  config.resolve = {
    ...config.resolve,
    modules: [...(config.resolve?.modules ?? ['node_modules']), process.cwd()]
  }

  config.experiments = {
    ...config.experiments,
    outputModule: true
  }

  config.plugins = [
    ...(config.plugins ?? []),
    new ModuleFederationPlugin({
      name: mfContainerName,
      filename: 'remoteEntry.js',
      exposes: mfConfig.exposes,
      shared,
      shareScope: 'angular_21',
      library: { type: 'module' },
      dts: false
    })
  ]

  return config
}
