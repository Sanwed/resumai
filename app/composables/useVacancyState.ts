export const useVacancyState = (projectId: string) => {
  const editMode = useState(`project-${projectId}-editMode`, () => false);
  const collapsed = useState(`project-${projectId}-collapsed`, () => false);

  return { editMode, collapsed };
};
