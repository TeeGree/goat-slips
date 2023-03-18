using GoatSlips.Attributes;
using GoatSlips.Exceptions;
using GoatSlips.Helpers;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class ProjectController : ControllerBase
    {

        private readonly ILogger<ProjectController> _logger;
        private readonly IProjectService _projectService;
        private readonly IUserService _userService;

        public ProjectController(
            ILogger<ProjectController> logger,
            IProjectService projectService,
            IUserService userService
        )
        {
            _logger = logger;
            _projectService = projectService;
            _userService = userService;
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
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("Create", Name = "CreateProject")]
        public IActionResult CreateProject(CreateProjectBody body)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                _projectService.CreateProject(body.ProjectName);
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

        [HttpPost("Update", Name = "UpdateProject")]
        public IActionResult UpdateProject(UpdateProjectBody body)
        {
            try
            {
                User? user = HttpContext.Items["User"] as User;
                if (user == null)
                {
                    throw new Exception("No user logged in!");
                }
                _userService.ValidateAccessForProject(AccessRights.Admin, HttpContext, body.ProjectId);
                _projectService.UpdateProject(
                    body.ProjectId,
                    body.AllowedTaskIds,
                    user.Id,
                    body.Rate,
                    body.FirstName,
                    body.LastName,
                    body.BusinessName,
                    body.Email,
                    body.Address1,
                    body.Address2,
                    body.City,
                    body.State,
                    body.Zip,
                    body.ZipExtension,
                    body.LockDate);
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

        [HttpDelete("Delete/{id}", Name = "DeleteProject")]
        public IActionResult DeleteProject(int id)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                _projectService.DeleteProject(id);
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