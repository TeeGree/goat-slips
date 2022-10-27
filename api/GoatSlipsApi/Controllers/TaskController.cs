using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Models;
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
        private readonly ITaskService _taskService;

        public TaskController(
            ILogger<TaskController> logger,
            IGoatSlipsContext goatSlipsContext,
            IProjectTaskService projectTaskService,
            ITaskService taskService
        )
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
            _projectTaskService = projectTaskService;
            _taskService = taskService;
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
                _taskService.CreateTask(body.TaskName);
                return Ok();
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
                _taskService.DeleteTask(id);
                return Ok();
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