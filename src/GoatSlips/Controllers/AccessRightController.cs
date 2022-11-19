using GoatSlips.Attributes;
using GoatSlips.DAL;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class AccessRightController : ControllerBase
    {
        private readonly ILogger<AccessRightController> _logger;
        private readonly IAccessRightRepository _accessRightRepository;

        public AccessRightController(
            ILogger<AccessRightController> logger,
            IAccessRightRepository accessRightRepository
        )
        {
            _logger = logger;
            _accessRightRepository = accessRightRepository;
        }

        [HttpGet(Name = "GetAllAccessRights")]
        public ActionResult<IEnumerable<AccessRight>> Get()
        {
            try
            {
                DbSet<AccessRight>? accessRights = _accessRightRepository.AccessRights;
                return Ok(accessRights);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}
