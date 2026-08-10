export function useNotification() {
  const open = useState('notifications-open', () => false);
  const oldNotificationsLoaded = useState('notifications-loaded', () => false);

  const loading = ref(false);

  const getByRead = async (read = false) => {
    try {
      loading.value = true;

      const response = await $fetch('/api/notification', {
        query: { read },
      });

      const notifications = response.map((el) => ({ ...el, createdAt: new Date(el.createdAt) }));

      return notifications;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const updateOne = async (notificationId: string) => {
    try {
      loading.value = true;

      const updated = await $fetch(`/api/notification/${notificationId}`, {
        method: 'PATCH',
      });

      const notification = { ...updated, createdAt: new Date(updated.createdAt) };

      return notification;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const updateMany = async (notificationIds: string[]) => {
    try {
      loading.value = true;

      const updated = await $fetch('/api/notification/', {
        method: 'PATCH',
        body: {
          notificationIds,
        },
      });

      const notifications = updated.map((el) => ({ ...el, createdAt: new Date(el.createdAt) }));

      return notifications;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  return { loading, open, oldNotificationsLoaded, getByRead, updateOne, updateMany };
}
