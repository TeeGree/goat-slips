using GoatSlips.Attributes;
using GoatSlips.DAL;
using GoatSlips.Exceptions;
using GoatSlips.Helpers;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class TaskController : ControllerBase
    {

        private readonly ILogger<TaskController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;
        private readonly IProjectTaskService _projectTaskService;
        private readonly ITaskService _taskService;
        private readonly IUserService _userService;

        public TaskController(
            ILogger<TaskController> logger,
            IGoatSlipsContext goatSlipsContext,
            IProjectTaskService projectTaskService,
            ITaskService taskService,
            IUserService userService
        )
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
            _projectTaskService = projectTaskService;
            _taskService = taskService;
            _userService = userService;
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

        [HttpPost("Create", Name = "CreateTask")]
        public IActionResult CreateTask(CreateTaskBody body)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                _taskService.CreateTask(body.TaskName);
                return Ok();
            }
            catch (InsufficientAccessException e)
            {
                return Problem(e.Message, statusCode: InsufficientAccessException.StatusCode);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpDelete("Delete/{id}", Name = "DeleteTask")]
        public IActionResult DeleteTask(int id)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                _taskService.DeleteTask(id);
                return Ok();
            }
            catch (InsufficientAccessException e)
            {
                return Problem(e.Message, statusCode: InsufficientAccessException.StatusCode);
            }
            catch (CodeInUseException e)
            {
                return Problem(e.Message, statusCode: CodeInUseException.StatusCode);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}