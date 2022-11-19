using GoatSlips.Attributes;
using GoatSlips.DAL;
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
    public sealed class LaborCodeController : ControllerBase
    {

        private readonly ILogger<LaborCodeController> _logger;
        private readonly ILaborCodeRepository _laborCodeRepository;
        private readonly ILaborCodeService _laborCodeService;
        private readonly IUserService _userService;

        public LaborCodeController(
            ILogger<LaborCodeController> logger,
            ILaborCodeRepository laborCodeRepository,
            ILaborCodeService laborCodeService,
            IUserService userService
        )
        {
            _logger = logger;
            _laborCodeRepository = laborCodeRepository;
            _laborCodeService = laborCodeService;
            _userService = userService;
        }

        [HttpGet(Name = "GetLaborCodes")]
        public ActionResult<IEnumerable<LaborCode>> Get()
        {
            try
            {
                return Ok(_laborCodeRepository.LaborCodes);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("Create", Name = "CreateLaborCode")]
        public IActionResult CreateLaborCode(CreateLaborCodeBody body)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                _laborCodeService.CreateLaborCode(body.LaborCodeName);
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

        [HttpDelete("Delete/{id}", Name = "DeleteLaborCode")]
        public IActionResult DeleteLaborCode(int id)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                _laborCodeService.DeleteLaborCode(id);
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