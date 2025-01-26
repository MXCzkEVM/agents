//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-01-26",
  experimental: { openAPI: true },
  openAPI: {
    meta: {
      title: 'Agent Server APIs',
      description: 'API for proxy sending transactions',
      version: '1.0'
    },
    production: 'runtime'
  },
});