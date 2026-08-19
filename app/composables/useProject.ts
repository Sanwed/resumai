import type z from 'zod';

export function useProject() {
  const loading = ref(false);

  const update = async (projectId: string, body: Partial<z.infer<typeof projectUpdateSchema>>) => {
    try {
      loading.value = true;

      const updated = await $fetch(`/api/project/${projectId}`, {
        method: 'PATCH',
        body,
      });
      const project = {
        ...updated,
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt),
      };

      return project;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const create = async (body: z.infer<typeof projectCreateSchema>) => {
    try {
      loading.value = true;

      const created = await $fetch(`/api/project`, {
        method: 'POST',
        body,
      });

      const project = {
        ...created,
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      };
      return project;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const remove = async (projectId: string) => {
    try {
      loading.value = true;
      const deleted = await $fetch(`/api/project/${projectId}`, { method: 'DELETE' });

      return deleted;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  return { loading, update, create, remove };
}
