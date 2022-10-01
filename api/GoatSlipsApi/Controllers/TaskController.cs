using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace GoatSlipsApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class TaskController : ControllerBase
    {

        private readonly ILogger<TaskController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;

        public TaskController(ILogger<TaskController> logger, IGoatSlipsContext goatSlipsContext)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
        }

        [HttpGet(Name = "GetTasks")]
        public ActionResult<IEnumerable<Models.Database.Task>> Get()
        {
            DbSet<Models.Database.Task>? tasks = _goatSlipsContext.Tasks;
            if (tasks == null)
            {
                var message = "No tasks found!";
                _logger.LogError(message);
                return Problem(message);
            }
            return tasks;
        }

        [HttpGet("ProjectsAllowedTasks", Name = "GetAllowedTasksForProjects")]
        public ActionResult<IEnumerable<ProjectTaskMapping>> GetAllowedTasksForProjects()
        {
            int[]? allTaskIds = _goatSlipsContext.Tasks?.Select(t => t.Id).ToArray();
            if (allTaskIds == null)
            {
                var message = "No tasks found!";
                _logger.LogError(message);
                return Problem(message);
            }

            int[]? allProjectIds = _goatSlipsContext.Projects?.Select(t => t.Id).ToArray();
            if (allProjectIds == null)
            {
                var message = "No projects found!";
                _logger.LogError(message);
                return Problem(message);
            }

            var projectTaskMappings = new List<ProjectTaskMapping>();
            foreach (int projectId in allProjectIds)
            {
                ProjectTask[]? projectTasks = _goatSlipsContext.ProjectTasks?.Where(pt => pt.ProjectId == projectId).ToArray();
                if (projectTasks != null && projectTasks.Any())
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