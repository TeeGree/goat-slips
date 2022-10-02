using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using GoatSlipsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlipsApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class ProjectController : ControllerBase
    {

        private readonly ILogger<ProjectController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;
        private readonly IProjectService _projectService;

        public ProjectController(
            ILogger<ProjectController> logger,
            IGoatSlipsContext goatSlipsContext,
            IProjectService projectService
        )
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
            _projectService = projectService;
        }

        [HttpGet(Name = "GetProjects")]
        public ActionResult<IEnumerable<Project>> Get()
        {
            try
            {
                IEnumerable<Project> tasks = _projectService.GetAllProjects();
                return Ok(tasks);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("Tasks/{projectId}", Name = "GetTasksForProject")]
        public ActionResult<IEnumerable<Models.Database.Task>> GetTasksForProject(int projectId)
        {
            try
            {
                IEnumerable<Models.Database.Task> tasks = _projectService.GetTasksForProject(projectId);
                return Ok(tasks);
            } catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}