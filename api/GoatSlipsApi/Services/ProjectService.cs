using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.Services
{
    public interface IProjectService
    {
        IEnumerable<Project> GetAllProjects();
        IEnumerable<Models.Database.Task> GetTasksForProject(int projectId);
    }
    public class ProjectService : IProjectService
    {
        private readonly IGoatSlipsContext _dbContext;
        public ProjectService(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public IEnumerable<Project> GetAllProjects()
        {
            DbSet<Project>? projects = _dbContext.Projects;
            if (projects == null)
            {
                throw new Exception("No projects found!");
            }
            return projects;
        }

        public IEnumerable<Models.Database.Task> GetTasksForProject(int projectId)
        {
            DbSet<ProjectTask>? projectTasks = _dbContext.ProjectTasks;
            if (projectTasks == null)
            {
                throw new Exception("No project tasks found!");
            }

            DbSet<Models.Database.Task>? tasks = _dbContext.Tasks;
            if (tasks == null)
            {
                throw new Exception("No tasks found!");
            }

            return from projectTask in projectTasks
                   join task in tasks
                       on projectTask.TaskId equals task.Id
                   where projectTask.ProjectId == projectId
                   select task;
        }
    }
}
