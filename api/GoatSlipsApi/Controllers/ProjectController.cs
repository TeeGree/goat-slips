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
    public sealed class ProjectController : ControllerBase
    {

        private readonly ILogger<ProjectController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;

        public ProjectController(ILogger<ProjectController> logger, IGoatSlipsContext goatSlipsContext)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
        }

        [HttpGet(Name = "GetProjects")]
        public ActionResult<IEnumerable<Project>> Get()
        {
            DbSet<Project>? projects = _goatSlipsContext.Projects;
            if (projects == null)
            {
                var message = "No projects found!";
                _logger.LogError(message);
                return Problem(message);
            }
            return projects;
        }

        [HttpGet("Tasks/{projectId}", Name = "GetTasksForProject")]
        public ActionResult<IEnumerable<Models.Database.Task>> GetTasksForProject(int projectId)
        {
            DbSet<ProjectTask>? projectTasks = _goatSlipsContext.ProjectTasks;
            if (projectTasks == null)
            {
                var message = "No project tasks found!";
                _logger.LogError(message);
                return Problem(message);
            }

            DbSet<Models.Database.Task>? tasks = _goatSlipsContext.Tasks;
            if (tasks == null)
            {
                var message = "No tasks found!";
                _logger.LogError(message);
                return Problem(message);
            }

            IEnumerable<Models.Database.Task> tasksForProject = from projectTask in projectTasks
                                                                join task in tasks
                                                                    on projectTask.TaskId equals task.Id
                                                                where projectTask.ProjectId == projectId
                                                                select task;
            return Ok(tasksForProject);
        }
    }
}