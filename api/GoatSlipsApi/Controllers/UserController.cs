using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
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
    public sealed class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;
        private readonly IUserService _userService;
        private readonly ISecretService _secretService;
        private readonly IJwtUtils _jwtUtils;

        public UserController(
            ILogger<UserController> logger,
            IGoatSlipsContext goatSlipsContext,
            IUserService userService,
            ISecretService secretService,
            IJwtUtils jwtUtils)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
            _userService = userService;
            _secretService = secretService;
            _jwtUtils = jwtUtils;
        }

        [HttpGet(Name = "GetUsers")]
        public ActionResult<IEnumerable<User>> Get()
        {
            DbSet<User>? users = _goatSlipsContext.Users;
            if (users == null)
            {
                var message = "No users found!";
                _logger.LogError(message);
                return Problem(message);
            }
            return users;
        }

        [AllowAnonymous]
        [HttpPost("Authenticate", Name = "Authenticate")]
        public IActionResult Authenticate([FromBody] AuthenticateBody authenticateBody)
        {
            string username = authenticateBody.Username ?? "";
            User? user = _userService.GetByUsername(username);
            if (user?.Password == null)
            {
                return BadRequest("Invalid username!");
            }

            string password = authenticateBody.Password ?? "";
            bool authenticated = _secretService.Verify(password, user.Password);
            if (!authenticated)
            {
                return BadRequest("Incorrect password!");
            }

            string token = _jwtUtils.GenerateToken(user);
            HttpContext.Response.Cookies.Append(
                "Authorization",
                token,
                new CookieOptions {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Secure = true
                });

            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("IsAuthenticated", Name = "IsAuthenticated")]
        public ActionResult<bool> IsAuthenticated()
        {
            int? userId = _jwtUtils.ValidateTokenFromContext(HttpContext);

            return Ok(userId != null);
        }
    }
}