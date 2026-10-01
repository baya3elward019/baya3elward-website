/**
 * Images uploaded through Pages CMS are saved as "/images/...".
 * When the site lives under a sub-path (e.g. /my-repo/), those absolute paths
 * need the base prefix. This plugin fixes <img src> and <a href> inside Markdown.
 */
export default function rehypeBase({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  const fix = (url) =>
    typeof url === 'string' && prefix && url.startsWith('/') && !url.startsWith('//') && !url.startsWith(prefix + '/')
      ? prefix + url
      : url;

  const walk = (node) => {
    if (node.type === 'element') {
      if (node.tagName === 'img' && node.properties?.src) node.properties.src = fix(node.properties.src);
      if (node.tagName === 'a' && node.properties?.href) node.properties.href = fix(node.properties.href);
    }
    if (node.children) node.children.forEach(walk);
  };
  return (tree) => walk(tree);
}
