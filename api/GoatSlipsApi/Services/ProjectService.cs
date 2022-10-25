using GoatSlipsApi.DAL;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using Task = GoatSlipsApi.Models.Database.Task;

namespace GoatSlipsApi.Services
{
    public interface IProjectService
    {
        IEnumerable<Project> GetAllProjects();
        IEnumerable<Models.Database.Task> GetTasksForProject(int projectId);
        void CreateProject(string projectName);
        void DeleteProject(int projectId);
        void SetAllowedTasksForProject(int projectId, HashSet<int> allowedTaskIds);
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

        public void SetAllowedTasksForProject(int projectId, HashSet<int> allowedTaskIds)
        {
            DbSet<Project>? projects = _dbContext.Projects;
            if (projects == null)
            {
                throw new Exception("No projects found!");
            }

            if (!projects.Any(p => p.Id == projectId))
            {
                throw new Exception("Project does not exist!");
            }

            DbSet<Task>? tasks = _dbContext.Tasks;
            if (tasks == null)
            {
                throw new Exception("No tasks found!");
            }

            if (allowedTaskIds.Any(at => !tasks.Any(t => t.Id == at)))
            {
                throw new Exception("Task does not exist!");
            }

            DbSet<ProjectTask>? projectTaskMapping = _dbContext.ProjectTasks;
            if (projectTaskMapping == null)
            {
                throw new Exception("No project task mappings found!");
            }

            ProjectTask[] projectTasksToRemove = (from pr in projectTaskMapping
                                                  where pr.ProjectId == projectId &&
                                                  !allowedTaskIds.Contains(pr.TaskId)
                                                  select pr).ToArray();

            DbSet<TimeSlip>? timeSlips = _dbContext.TimeSlips;
            if (timeSlips == null)
            {
                throw new Exception("No time slips found!");
            }

            TimeSlip[] projectTimeSlips = timeSlips.Where(ts => ts.ProjectId == projectId).ToArray();

            TimeSlip[] timeSlipsToClearTaskIds = projectTimeSlips.Where(ts =>
                projectTasksToRemove.Any(pt => pt.TaskId == ts.TaskId)
            ).ToArray();

            foreach (TimeSlip timeSlip in timeSlipsToClearTaskIds)
            {
                timeSlip.TaskId = null;
                timeSlips.AddOrUpdate(timeSlip);
            }

            projectTaskMapping.RemoveRange(projectTasksToRemove);

            int[] taskIdsToAdd = allowedTaskIds.Where(taskId =>
                !projectTaskMapping.Any(
                    pt => pt.ProjectId == projectId &&
                    pt.TaskId == taskId
                )
            ).ToArray();

            ProjectTask[] tasksToAdd = taskIdsToAdd.Select(taskId => new ProjectTask
            {
                TaskId = taskId,
                ProjectId = projectId
            }).ToArray();

            projectTaskMapping.AddRange(tasksToAdd);

            _dbContext.SaveChanges();
        }
    }
}
