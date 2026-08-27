<script lang="ts" setup>
  const cookieConsentToastId = 'cookie-consent-banner';
  const toast = useToast();

  onMounted(async () => {
    const cookie = useCookie('cookie-consent', { maxAge: 60 * 60 * 24 * 30 });
    if (cookie.value === 'accepted') {
      return;
    }

    toast.add({
      id: cookieConsentToastId,
      title: 'We use first-party cookies to enhance your experience on our website.',
      duration: 0,
      color: 'info',
      icon: 'i-lucide-cookie',
      close: false,
      actions: [
        {
          label: 'Accept',
          color: 'primary',
          variant: 'solid',
          size: 'lg',
          class: 'min-w-30 justify-center',
          onClick: () => {
            cookie.value = 'accepted';
            toast.remove(cookieConsentToastId);
          },
        },
      ],
    });
  });
</script>

<template>
  <div>
    <AppHeader />

    <UMain id="main-content" tabindex="-1">
      <slot />
    </UMain>

    <AppFooter />
  </div>
</template>
