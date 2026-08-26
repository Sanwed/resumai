export default defineNuxtPlugin(() => {
  injectHead().hooks?.hook('tags:resolve', (context) => {
    const robots = context.tags.find((tag) => tag.tag === 'meta' && tag.props.name === 'robots')?.props.content;

    if (typeof robots !== 'string' || !robots.split(',').some((directive) => directive.trim() === 'noindex')) {
      return;
    }

    context.tags = context.tags.filter((tag) => !(tag.tag === 'link' && tag.props.rel === 'canonical'));
  });
});
