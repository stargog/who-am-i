/**
 * @deprecated Use npm run import:pool instead.
 * Deck data comes from who_am_i_pool.csv and local files in apps/web/public/deck/.
 * This script no longer calls Wikipedia to avoid rate limits.
 */
console.error(`
build-deck is disabled (Wikipedia API removed from the pipeline).

Use:
  npm run import:pool

Add images locally:
  apps/web/public/deck/<entry-id>.jpg

Optional CSV columns in who_am_i_pool.csv:
  category,name,image,hints,facts
`);
process.exit(1);
