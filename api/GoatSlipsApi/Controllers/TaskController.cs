using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using GoatSlipsApi.Services;
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
        private readonly IProjectTaskService _projectTaskService;

        public TaskController(
            ILogger<TaskController> logger,
            IGoatSlipsContext goatSlipsContext,
            IProjectTaskService projectTaskService
        )
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
            _projectTaskService = projectTaskService;
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
            try
            {
                IEnumerable<ProjectTaskMapping> projectTasks = _projectTaskService.GetAllowedTasksForProjects();
                return Ok(projectTasks);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}