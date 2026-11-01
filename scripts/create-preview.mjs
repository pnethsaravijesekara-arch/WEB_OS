import { readFile, writeFile } from 'node:fs/promises';

// A portable, self-contained export of the same compiled application.
// Production hosting still uses dist/index.html and its ordinary static assets.
let html = (await readFile('dist/index.html', 'utf8')).replace('<html ', '<html data-portable ').replace(/<link rel="manifest"[^>]*>/, '');
const jsPath = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/)?.[1];
const cssPath = html.match(/<link[^>]*href="([^"]+\.css)"[^>]*>/)?.[1];
if (!jsPath || !cssPath) throw new Error('Built asset links not found');
const js = await readFile(`dist/${jsPath.replace(/^\.\//, '')}`, 'utf8');
let css = await readFile(`dist/${cssPath.replace(/^\.\//, '')}`, 'utf8');
const dataUrl = async path => `data:image/svg+xml;base64,${(await readFile(path)).toString('base64')}`;
const wallpaper = `data:image/webp;base64,${(await readFile('public/aurora.webp')).toString('base64')}`;
const mark = await dataUrl('public/mark.svg');
css = css.replace(/url\((?:"|')?(?:\.\.\/|\.\/|\/)?aurora\.webp(?:"|')?\)/g, 'var(--portable-wall)');
css = ':root{--portable-wall:url("'+wallpaper+'")}'+css;
html = html.replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/, () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
html = html.replace(/<link[^>]*href="[^"]+\.css"[^>]*>/, () => `<style>${css}</style>`);
html = html.replace(/href="[^\"]*mark\.svg"/, `href="${mark}"`);
await writeFile('Velora.html', html);
console.log('Created Velora.html for the Windows launcher');
