// Module Federation definition for the shell container.
//
// Previously this object was typed with `ModuleFederationConfig` from the deprecated
// `@nx/module-federation` package and consumed by the `withModuleFederation` wrapper from
// `@nx/angular/module-federation`. Under the direct `@module-federation/enhanced/rspack`
// configuration (see `rspack-mf.config.ts`) the wrapper is gone, so this is now a plain
// hand-reconstructed description of the container: its name and its exposed modules. The
// `shared` map is reconstructed by hand in `rspack-mf.config.ts` (Nx tooling does not carry it
// over to a direct Rspack config), so it is intentionally not declared here.
const config = {
  name: 'onecx-shell-ui',
  exposes: {
    './OneCXShellToastComponent': 'src/app/remotes/shell-toast/shell-toast.component.main.ts'
  }
}

export default config
