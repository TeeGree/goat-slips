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
        private readonly IJwtUtils _jwtUtils;

        public UserController(
            ILogger<UserController> logger,
            IGoatSlipsContext goatSlipsContext,
            IUserService userService,
            IJwtUtils jwtUtils)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
            _userService = userService;
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

        // TODO: Remove once login is created
        [AllowAnonymous]
        [HttpGet("GenerateJwtToken/{userId}", Name = "GenerateJwtToken")]
        public string GenerateJwtToken(int userId)
        {
            User? user = _userService.GetById(userId);
            if (user == null)
            {
                throw new Exception("Invalid user ID!");
            }

            return _jwtUtils.GenerateToken(user);
        }
    }
}