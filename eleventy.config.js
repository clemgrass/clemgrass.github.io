export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy('src/favicon.svg');
  eleventyConfig.addWatchTarget('contenido/');
  eleventyConfig.addWatchTarget('lib/');
}

export const config = {
  dir: { input: 'src', output: '_site' },
  htmlTemplateEngine: 'njk'
};
