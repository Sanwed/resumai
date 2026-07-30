<script lang="ts" setup>
  const toast = useToast();

  onMounted(async () => {
    const cookie = useCookie('cookie-consent');
    if (cookie.value === 'accepted') {
      return;
    }

    toast.add({
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
          },
        },
      ],
    });
  });
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <slot />
    </UMain>

    <AppFooter />
  </div>
</template>
