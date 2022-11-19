using GoatSlips.DAL;
using GoatSlips.Exceptions;
using GoatSlips.Models.Database;
using System.Data.Entity;
using Task = GoatSlips.Models.Database.Task;

namespace GoatSlips.Services
{
    public interface ITaskService
    {
        void CreateTask(string taskName);
        void DeleteTask(int taskId);
    }
    public sealed class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly ITimeSlipRepository _timeSlipRepository;
        private readonly IProjectTaskRepository _projectTaskRepository;
        private readonly IGoatSlipsContext _dbContext;
        public TaskService(
            ITaskRepository taskRepository,
            ITimeSlipRepository timeSlipRepository,
            IProjectTaskRepository projectTaskRepository,
            IGoatSlipsContext dbContext
        )
        {
            _taskRepository = taskRepository;
            _timeSlipRepository = timeSlipRepository;
            _projectTaskRepository = projectTaskRepository;
            _dbContext = dbContext;
        }

        public void CreateTask(string taskName)
        {
            DbSet<Task> tasks = _taskRepository.Tasks;

            tasks.Add(new Task
            {
                Name = taskName
            });

            _dbContext.SaveChanges();
        }

        public void DeleteTask(int taskId)
        {
            DbSet<Task> tasks = _taskRepository.Tasks;

            var task = tasks.FirstOrDefault(p => p.Id == taskId);

            if (task == null)
            {
                throw new Exception("Task does not exist!");
            }

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

            if (timeSlips.Any(ts => ts.TaskId == taskId))
            {
                throw new CodeInUseException("Task is in use!");
            }

            DbSet<ProjectTask> projectTasks = _projectTaskRepository.ProjectTasks;

            IEnumerable<ProjectTask> projectTasksToDelete = projectTasks.Where(pt => pt.TaskId == taskId);

            if (projectTasksToDelete.Any())
            {
                projectTasks.RemoveRange(projectTasksToDelete);
            }

            tasks.Remove(task);

            _dbContext.SaveChanges();
        }
    }
}
