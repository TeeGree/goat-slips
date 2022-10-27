using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;

namespace GoatSlipsApi.Services
{
    public interface IProjectTaskService
    {
        IEnumerable<ProjectTaskMapping> GetAllowedTasksForProjects();
    }
    public sealed class ProjectTaskService : IProjectTaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectTaskRepository _projectTaskRepository;
        public ProjectTaskService(
            ITaskRepository taskRepository,
            IProjectRepository projectRepository,
            IProjectTaskRepository projectTaskRepository
        )
        {
            _taskRepository = taskRepository;
            _projectRepository = projectRepository;
            _projectTaskRepository = projectTaskRepository;
        }

        public IEnumerable<ProjectTaskMapping> GetAllowedTasksForProjects()
        {
            int[] allTaskIds = _taskRepository.Tasks.Select(t => t.Id).ToArray();

            int[] allProjectIds = _projectRepository.Projects.Select(t => t.Id).ToArray();

            var projectTaskMappings = new List<ProjectTaskMapping>();
            foreach (int projectId in allProjectIds)
            {
                ProjectTask[] projectTasks = _projectTaskRepository.ProjectTasks.Where(pt => pt.ProjectId == projectId).ToArray();
                if (projectTasks.Any())
                {
                    projectTaskMappings.Add(new ProjectTaskMapping
                    {
                        ProjectId = projectId,
                        AllowedTaskIds = projectTasks.Select(pt => pt.TaskId),
                    });
                }
                else
                {
                    projectTaskMappings.Add(new ProjectTaskMapping
                    {
                        ProjectId = projectId,
                        AllowedTaskIds = allTaskIds,
                    });
                }
            }

            return projectTaskMappings;
        }
    }
}
