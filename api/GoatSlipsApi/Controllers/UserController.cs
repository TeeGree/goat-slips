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
        public IEnumerable<User> Get()
        {
            DbSet<User>? users = _goatSlipsContext.Users;
            if (users == null)
            {
                var message = "No users found!";
                _logger.LogError(message);
                throw new Exception(message);
            }
            return users;
        }

        [AllowAnonymous]
        [HttpPost("Authenticate", Name = "Authenticate")]
        public void Authenticate(string username, string password)
        {
            User? user = _userService.GetByUsername(username);
            if (user?.Password == null)
            {
                throw new Exception("Invalid username!");
            }

            bool authenticated = _secretService.Verify(password, user.Password);
            if (!authenticated)
            {
                throw new Exception("Incorrect password!");
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
        }
    }
}