<script setup lang="ts">
  import type { FetchError } from 'ofetch';
  import type { Notification } from '~/generated/prisma/client';

  type Props = {
    loading?: boolean;
    error?: FetchError;
  };
  defineProps<Props>();

  const { data: notifications } = useNuxtData<Notification[]>('notifications');

  const toast = useToast();

  const { open, oldNotificationsLoaded, getByRead, updateOne, updateMany } = useNotification();

  const loadOldNotifications = async () => {
    if (oldNotificationsLoaded.value) return;

    try {
      const oldNotifications = await getByRead(true);

      if (notifications.value && oldNotifications) {
        notifications.value = [...notifications.value, ...oldNotifications];
      }

      oldNotificationsLoaded.value = true;
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    }
  };

  const onNotificationClick = async (event: PointerEvent, id: string) => {
    event.preventDefault();

    try {
      const updated = await updateOne(id);

      if (notifications.value && updated) {
        notifications.value = notifications.value.map((n) => (n.id === updated.id ? updated : n));
      }

      open.value = false;

      const link = (event.currentTarget as HTMLAnchorElement).href;
      navigateTo(link);
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    }
  };

  const onReadAll = async () => {
    try {
      const updated = await updateMany(unreadNotifications.value.map((n) => n.id));

      const ids = updated?.map((n) => n.id);

      if (notifications.value && ids) {
        notifications.value = notifications.value.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n));
      }
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    }
  };

  const unreadNotifications = computed(() => notifications.value?.filter((n) => !n.read) ?? []);
  const oldNotifications = computed(() => notifications.value?.filter((n) => n.read) ?? []);
</script>

<template>
  <USlideover v-model:open="open" title="Notifications" :ui="{ body: 'flex flex-col gap-y-5' }">
    <template #body>
      <div v-if="loading" class="flex items-center justify-center h-30">
        <UIcon name="i-lucide-loader" class="animate-spin size-6" />
      </div>
      <div v-else-if="error" class="flex items-center gap-x-2">
        <UIcon name="i-lucide-circle-x" size="20" class="shrink-0" />
        <p class="text-dimmed">{{ error.statusMessage }}</p>
      </div>
      <div v-else-if="!unreadNotifications.length" class="flex items-center gap-x-2">
        <UIcon name="i-lucide-inbox" size="20" class="shrink-0" />
        <p class="text-dimmed">No new notifications</p>
      </div>
      <ul class="flex flex-col gap-y-1">
        <li v-for="notification in unreadNotifications" :key="notification.id">
          <NotificationCard
            :link="notification.link"
            :created-at="notification.createdAt"
            :message="notification.message"
            :title="notification.title"
            :chip="!notification.read"
            @click="
              (event) => {
                onNotificationClick(event, notification.id);
              }
            "
          />
        </li>
      </ul>
      <UCollapsible>
        <UButton
          label="Old notifications"
          color="neutral"
          variant="soft"
          loading-auto
          loading-icon="i-lucide-loader"
          trailing-icon="i-lucide-chevron-down"
          :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }"
          @click="loadOldNotifications"
        />
        <template #content>
          <UEmpty
            v-if="!oldNotifications.length"
            icon="i-lucide-circle-x"
            variant="naked"
            title="No old notifications"
          />
          <ul class="mt-1 flex flex-col gap-y-1">
            <li v-for="notification in oldNotifications" :key="notification.id">
              <NotificationCard
                :link="notification.link"
                :created-at="notification.createdAt"
                :message="notification.message"
                :title="notification.title"
                :chip="!notification.read"
                @click="open = false"
              />
            </li>
          </ul>
        </template>
      </UCollapsible>
    </template>

    <template #footer>
      <UButton
        type="button"
        loading-auto
        loading-icon="i-lucide-loader"
        label="Mark all read"
        :disabled="!unreadNotifications.length"
        @click="onReadAll"
      />
    </template>
  </USlideover>
</template>
