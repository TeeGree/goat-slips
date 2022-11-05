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
