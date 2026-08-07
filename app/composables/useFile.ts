export function useFile(projectId: string) {
  const selectedFileId = useState<string | undefined>(`selected-file-${projectId}`, () => undefined);

  const loading = ref(false);

  const create = async (body: File[]) => {
    try {
      loading.value = true;

      const formData = new FormData();
      for (const file of body) {
        formData.append('file', file);
      }

      const files = await $fetch(`/api/file/`, {
        method: 'POST',
        query: { projectId },
        body: formData,
      });

      return files;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const removeOne = async (fileId: string) => {
    try {
      loading.value = true;
      const deleted = await $fetch(`/api/file/${fileId}`, { method: 'DELETE' });

      return deleted;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const removeMany = async (fileIds: string[]) => {
    try {
      loading.value = true;
      const deleted = await $fetch(`/api/file/`, {
        method: 'DELETE',
        body: {
          fileIds,
        },
      });

      return deleted;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  return { selectedFileId, loading, create, removeOne, removeMany };
}
