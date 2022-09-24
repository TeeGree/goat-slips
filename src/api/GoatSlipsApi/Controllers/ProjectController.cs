using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlipsApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProjectController : ControllerBase
    {

        private readonly ILogger<ProjectController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;

        public ProjectController(ILogger<ProjectController> logger, IGoatSlipsContext goatSlipsContext)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
        }

        [HttpGet(Name = "GetProjects")]
        public IEnumerable<Project>? Get()
        {
            return _goatSlipsContext.Projects;
        }
    }
}