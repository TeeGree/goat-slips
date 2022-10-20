using GoatSlipsApi.DAL;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.Services
{
    public interface IProjectService
    {
        IEnumerable<Project> GetAllProjects();
        IEnumerable<Models.Database.Task> GetTasksForProject(int projectId);
        void CreateProject(string projectName);
        void DeleteProject(int projectId);
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

        public void CreateProject(string projectName)
        {
            DbSet<Project>? projects = _dbContext.Projects;
            if (projects == null)
            {
                throw new Exception("No projects found!");
            }

            projects.Add(new Project
            {
                Name = projectName
            });

            _dbContext.SaveChanges();
        }

        public void DeleteProject(int projectId)
        {
            DbSet<Project>? projects = _dbContext.Projects;
            if (projects == null)
            {
                throw new Exception("No projects found!");
            }

            var project = projects.FirstOrDefault(p => p.Id == projectId);

            if (project == null)
            {
                throw new Exception("Project does not exist!");
            }

            DbSet<TimeSlip>? timeSlips = _dbContext.TimeSlips;
            if (timeSlips == null)
            {
                throw new Exception("No time slips found!");
            }

            if (timeSlips.Any(ts => ts.ProjectId == projectId))
            {
                throw new ProjectInUseException("Project is in use!");
            }

            DbSet<ProjectTask>? projectTasks = _dbContext.ProjectTasks;
            if (projectTasks == null)
            {
                throw new Exception("No project tasks found!");
            }

            IEnumerable<ProjectTask> projectTasksToDelete = projectTasks.Where(pt => pt.ProjectId == projectId);

            if (projectTasksToDelete.Any())
            {
                projectTasks.RemoveRange(projectTasksToDelete);
            }

            projects.Remove(project);

            _dbContext.SaveChanges();
        }
    }
}
