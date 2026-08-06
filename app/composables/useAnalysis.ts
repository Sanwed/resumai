export function useAnalysis() {
  const loading = ref(false);

  const create = async (projectId: string, body: string[]) => {
    try {
      loading.value = true;

      await $fetch(`/api/analysis`, {
        method: 'POST',
        query: { projectId },
        body: {
          fileIds: body,
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  return { loading, create };
}
