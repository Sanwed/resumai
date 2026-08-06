import type { ProjectFile } from '~/generated/prisma/client';

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

      const files = await $fetch(`/api/file/${projectId}`, {
        method: 'POST',
        body: formData,
      });

      return files;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const remove = async (fileId: string) => {
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

  return { selectedFileId, loading, create, remove };
}
