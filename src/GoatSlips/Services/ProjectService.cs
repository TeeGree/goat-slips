using GoatSlips.DAL;
using GoatSlips.Exceptions;
using GoatSlips.Models.Database;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using Task = GoatSlips.Models.Database.Task;

namespace GoatSlips.Services
{
    public interface IProjectService
    {
        IEnumerable<Project> GetAllProjects();
        IEnumerable<Task> GetTasksForProject(int projectId);
        void CreateProject(string projectName);
        void DeleteProject(int projectId);
        void UpdateProject(
            int projectId,
            HashSet<int> allowedTaskIds,
            int userId,
            decimal rate,
            string? firstName,
            string? lastName,
            string? businessName,
            string? email,
            string? address1,
            string? address2,
            string? city,
            string? state,
            int? zip,
            int? zipExtension
        );
    }
    public sealed class ProjectService : IProjectService
    {
        private readonly IGoatSlipsContext _dbContext;
        private readonly IProjectRepository _projectRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly ITimeSlipRepository _timeSlipRepository;
        private readonly IProjectTaskRepository _projectTaskRepository;
        private readonly IFavoriteTimeSlipRepository _favoriteTimeSlipRepository;
        private readonly IQueryRepository _queryRepository;
        private readonly IUserProjectRepository _userProjectRepository;

        public ProjectService(
            IGoatSlipsContext dbContext,
            IProjectRepository projectRepository,
            ITaskRepository taskRepository,
            ITimeSlipRepository timeSlipRepository,
            IProjectTaskRepository projectTaskRepository,
            IFavoriteTimeSlipRepository favoriteTimeSlipRepository,
            IQueryRepository queryRepository,
            IUserProjectRepository userProjectRepository
        )
        {
            _dbContext = dbContext;
            _projectRepository = projectRepository;
            _taskRepository = taskRepository;
            _timeSlipRepository = timeSlipRepository;
            _projectTaskRepository = projectTaskRepository;
            _favoriteTimeSlipRepository = favoriteTimeSlipRepository;
            _queryRepository = queryRepository;
            _userProjectRepository = userProjectRepository;
        }

        public IEnumerable<Project> GetAllProjects()
        {
            return _projectRepository.Projects;
        }

        public IEnumerable<Task> GetTasksForProject(int projectId)
        {
            DbSet<ProjectTask> projectTasks = _projectTaskRepository.ProjectTasks;

            DbSet<Task> tasks = _taskRepository.Tasks;

            return from projectTask in projectTasks
                   join task in tasks
                       on projectTask.TaskId equals task.Id
                   where projectTask.ProjectId == projectId
                   select task;
        }

        public void CreateProject(string projectName)
        {
            DbSet<Project> projects = _projectRepository.Projects;

            projects.Add(new Project
            {
                Name = projectName
            });

            _dbContext.SaveChanges();
        }

        public void DeleteProject(int projectId)
        {
            DbSet<Project> projects = _projectRepository.Projects;

            var project = projects.FirstOrDefault(p => p.Id == projectId);

            if (project == null)
            {
                throw new Exception("Project does not exist!");
            }

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

            if (timeSlips.Any(ts => ts.ProjectId == projectId))
            {
                throw new CodeInUseException("Project is in use!");
            }

            DbSet<ProjectTask> projectTasks = _projectTaskRepository.ProjectTasks;

            IEnumerable<ProjectTask> projectTasksToDelete = projectTasks.Where(pt => pt.ProjectId == projectId);

            if (projectTasksToDelete.Any())
            {
                projectTasks.RemoveRange(projectTasksToDelete);
            }

            // Delete user favorites that include this project.
            DbSet<FavoriteTimeSlip> favoriteTimeSlips = _favoriteTimeSlipRepository.FavoriteTimeSlips;
            IEnumerable<FavoriteTimeSlip> favoritesToDelete = favoriteTimeSlips.Where(fts => fts.ProjectId == projectId);
            favoriteTimeSlips.RemoveRange(favoritesToDelete);

            _dbContext.SaveChanges();

            _queryRepository.ReleaseProjectId(projectId);

            _userProjectRepository.ReleaseProjectId(projectId);

            projects.Remove(project);

            _dbContext.SaveChanges();
        }

        private void RemoveAllowedTasksForProject(int projectId, HashSet<int> allowedTaskIds, int userId)
        {
            DbSet<ProjectTask> projectTaskMapping = _projectTaskRepository.ProjectTasks;

            ProjectTask[] projectTasksToRemove = (from pr in projectTaskMapping
                                                  where pr.ProjectId == projectId &&
                                                  !allowedTaskIds.Contains(pr.TaskId)
                                                  select pr).ToArray();

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

            _timeSlipRepository.ClearTaskIdsForTimeSlips(projectId, projectTasksToRemove.Select(pt => pt.TaskId), userId);

            projectTaskMapping.RemoveRange(projectTasksToRemove);
        }

        public void UpdateProject(
            int projectId,
            HashSet<int> allowedTaskIds,
            int userId,
            decimal rate,
            string? firstName,
            string? lastName,
            string? businessName,
            string? email,
            string? address1,
            string? address2,
            string? city,
            string? state,
            int? zip,
            int? zipExtension
        )
        {
            Project? project = _projectRepository.Projects.Where(p => p.Id == projectId).FirstOrDefault();

            if (project == null)
            {
                throw new Exception("Project does not exist!");
            }

            project.Rate = rate;
            project.FirstName = firstName;
            project.LastName = lastName;
            project.BusinessName = businessName;
            project.Email = email;
            project.Address1 = address1;
            project.Address2 = address2;
            project.City = city;
            project.State = state;
            project.Zip = zip;
            project.ZipExtension = zipExtension;

            _projectRepository.Projects.AddOrUpdate(project);

            SetAllowedTasksForProject(projectId, allowedTaskIds, userId);
        }

        private void SetAllowedTasksForProject(int projectId, HashSet<int> allowedTaskIds, int userId)
        {
            DbSet<Task> tasks = _taskRepository.Tasks;

            if (allowedTaskIds.Any(at => !tasks.Any(t => t.Id == at)))
            {
                throw new Exception("Task does not exist!");
            }

            DbSet<ProjectTask> projectTaskMapping = _projectTaskRepository.ProjectTasks;

            RemoveAllowedTasksForProject(projectId, allowedTaskIds, userId);

            _projectTaskRepository.AddAllowedTasksForProject(projectId, allowedTaskIds);
        }
    }
}
