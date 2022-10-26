using System.Data.Entity;
using Task = GoatSlipsApi.Models.Database.Task;

namespace GoatSlipsApi.DAL
{
    public interface ITaskRepository
    {
        DbSet<Task> Tasks { get; }
    }
    public sealed class TaskRepository : ITaskRepository
    {
        public DbSet<Task> Tasks
        {
            get
            {
                DbSet<Task>? tasks = _dbContext.Tasks;
                if (tasks == null)
                {
                    throw new Exception("No tasks found!");
                }
                return tasks;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public TaskRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
