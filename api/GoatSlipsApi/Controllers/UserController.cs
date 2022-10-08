using GoatSlipsApi.Attributes;
using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using GoatSlipsApi.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Authentication;

namespace GoatSlipsApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IJwtUtils _jwtUtils;
        private readonly IUserService _userService;

        public UserController(
            ILogger<UserController> logger,
            IJwtUtils jwtUtils,
            IUserService userService)
        {
            _logger = logger;
            _jwtUtils = jwtUtils;
            _userService = userService;
        }

        [HttpGet(Name = "GetUsers")]
        public ActionResult<IEnumerable<User>> Get()
        {
            try
            {
                IEnumerable<User> users = _userService.GetAllUsers();
                return Ok(users);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("Authenticate", Name = "Authenticate")]
        public IActionResult Authenticate([FromBody] AuthenticateBody authenticateBody)
        {
            try
            {
                _userService.Authenticate(authenticateBody, HttpContext);
                return Ok();
            }
            catch (InvalidCredentialException e)
            {
                return BadRequest(e.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [AllowAnonymous]
        [HttpGet("IsAuthenticated", Name = "IsAuthenticated")]
        public ActionResult<bool> IsAuthenticated()
        {
            try
            {
                bool isAuthenticated = _userService.IsAuthenticated(HttpContext);
                return Ok(isAuthenticated);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [AllowAnonymous]
        [HttpGet("AnyUsers", Name = "AnyUsers")]
        public ActionResult<bool> AnyUsers()
        {
            try
            {
                bool anyUsers = _userService.AnyUsers();
                return Ok(anyUsers);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("CreateFirstUser", Name = "CreateFirstUser")]
        public IActionResult CreateFirstUser([FromBody] CreateUserBody createUserBody)
        {
            try
            {
                _userService.CreateFirstUser(createUserBody);
                return Ok();
            }
            catch(InvalidOperationException e)
            {
                return BadRequest(e.Message);
            }
            catch (ArgumentNullException e)
            {
                return BadRequest(e.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}