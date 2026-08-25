<template>
  <figure class="relative">
    <UPageCard variant="subtle" class="rounded-2xl">
      <video
        class="rounded-xl"
        data-v-baf90ddd=""
        preload="none"
        poster="https://res.cloudinary.com/nuxt/video/upload/so_3.3/v1708511800/ui-pro/video-nuxt-ui-pro_kwfbdh.jpg"
        :controls="true"
        :muted="true"
        playsinline
        aria-label="Promotional product interface demonstration"
        aria-describedby="promotional-video-description"
      >
        <source
          data-v-baf90ddd=""
          src="https://res.cloudinary.com/nuxt/video/upload/v1708511800/ui-pro/video-nuxt-ui-pro_kwfbdh.webm"
          type="video/webm"
        />
        <source
          data-v-baf90ddd=""
          src="https://res.cloudinary.com/nuxt/video/upload/v1708511800/ui-pro/video-nuxt-ui-pro_kwfbdh.mp4"
          type="video/mp4"
        />
        <source
          data-v-baf90ddd=""
          src="https://res.cloudinary.com/nuxt/video/upload/v1708511800/ui-pro/video-nuxt-ui-pro_kwfbdh.ogg"
          type="video/ogg"
        />
      </video>
    </UPageCard>
    <figcaption id="promotional-video-description" class="sr-only">
      Silent promotional interface demonstration. The surrounding page describes the product features shown.
    </figcaption>
  </figure>
</template>
