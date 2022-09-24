using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace GoatSlipsApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {

        private readonly ILogger<UserController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;

        public UserController(ILogger<UserController> logger, IGoatSlipsContext goatSlipsContext)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
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
    }
}