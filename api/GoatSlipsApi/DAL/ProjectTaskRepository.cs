using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.DAL
{
    public interface IProjectTaskRepository
    {
        DbSet<ProjectTask> ProjectTasks { get; }
        void AddAllowedTasksForProject(int projectId, HashSet<int> taskIds);
    }
    public sealed class ProjectTaskRepository : IProjectTaskRepository
    {
        public DbSet<ProjectTask> ProjectTasks
        {
            get
            {
                DbSet<ProjectTask>? projectTasks = _dbContext.ProjectTasks;
                if (projectTasks == null)
                {
                    throw new Exception("No project task mappings found!");
                }
                return projectTasks;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public ProjectTaskRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void AddAllowedTasksForProject(int projectId, HashSet<int> taskIds)
        {
            int[] taskIdsToAdd = taskIds.Where(taskId =>
                !ProjectTasks.Any(
                    pt => pt.ProjectId == projectId &&
                    pt.TaskId == taskId
                )
            ).ToArray();

            ProjectTask[] tasksToAdd = taskIdsToAdd.Select(taskId => new ProjectTask
            {
                TaskId = taskId,
                ProjectId = projectId
            }).ToArray();

            ProjectTasks.AddRange(tasksToAdd);

            _dbContext.SaveChanges();
        }
    }
}
