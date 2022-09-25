using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
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
    }
}