/*
 * Rspack loader that preserves the two `ModifySourcePlugin` source patches that were previously
 * applied to the shell build via `modify-source-webpack-plugin`.
 *
 * `ModifySourcePlugin` is a webpack-only plugin: for every module whose path matches a rule's
 * `test`, it appends a loader whose `ReplaceOperation('all', search, replace)` performs a global
 * regular-expression string replacement over the module's source. This loader applies the exact
 * same source-string transforms to the equivalent module set, keeping the PrimeNG and Angular
 * `SharedStylesHost` element-creation patches intact under Rspack.
 *
 * It is authored as plain CommonJS rather than TypeScript so that it is loaded by Rspack's
 * `require` directly (via `require.resolve` in the config) instead of being compiled on the fly
 * under the project's strict `tsconfig` during the build.
 */

/**
 * @typedef {Object} SourceReplaceRule
 * @property {(resourcePath: string) => boolean} test
 *   Matches against the resolved module path (equivalent to webpack's `module.resource`).
 * @property {{ search: string, replace: string }[]} replacements
 *   Global regex source replacements, applied in order.
 */

/** @type {SourceReplaceRule[]} */
const RULES = [
  {
    // Rewrite PrimeNG (and any module whose path contains "primeng") so its dynamically created
    // elements carry the OneCX style-id context, and disable PrimeNG's loaded-style caching.
    test: (resourcePath) => resourcePath.includes('primeng'),
    replacements: [
      {
        search: 'document\\.createElement\\(',
        replace: 'document.createElementFromPrimeNg({"this": this, "arguments": Array.from(arguments)},'
      },
      { search: 'Theme.setLoadedStyleName', replace: '(function(_){})' }
    ]
  },
  {
    // Replace createElement only in @angular/platform-browser's SharedStylesHost so component
    // styles keep the OneCX style-id context when appended to the head.
    test: (resourcePath) => resourcePath.includes('@angular/platform-browser'),
    replacements: [
      {
        search: "this\\.doc\\.createElement\\(\\'style\\'",
        replace: "this.doc.createElementFromSharedStylesHost({'this': this, 'arguments': Array.from(arguments)},'style'"
      }
    ]
  }
]

/**
 * @param {string} source
 * @returns {void}
 */
function rspackSourcePatchLoader(source) {
  // The loader context (`this`) is provided by Rspack at call time:
  //   - this.resourcePath: absolute path of the module being processed
  //   - this.async(): returns the (err, content) callback
  const callback = this.async()
  let output = source
  for (const rule of RULES) {
    if (!rule.test(this.resourcePath)) {
      continue
    }
    for (const { search, replace } of rule.replacements) {
      output = output.replace(new RegExp(search, 'g'), replace)
    }
  }
  callback(null, output)
}

module.exports = rspackSourcePatchLoader
