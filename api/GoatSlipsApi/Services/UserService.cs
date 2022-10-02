using GoatSlipsApi.DAL;
using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;
using System.Security.Authentication;

namespace GoatSlipsApi.Services
{
    public interface IUserService
    {
        IEnumerable<User> GetAllUsers();
        void Authenticate(AuthenticateBody authenticateBody, HttpContext httpContext);
        bool IsAuthenticated(HttpContext httpContext);
    }
    public sealed class UserService : IUserService
    {
        private readonly IGoatSlipsContext _dbContext;
        private readonly IUserRepository _userRepository;
        private readonly ISecretService _secretService;
        private readonly IJwtUtils _jwtUtils;
        public UserService(
            IGoatSlipsContext dbContext,
            IUserRepository userRepository,
            ISecretService secretService,
            IJwtUtils jwtUtils)
        {
            _dbContext = dbContext;
            _userRepository = userRepository;
            _secretService = secretService;
            _jwtUtils = jwtUtils;
        }

        public IEnumerable<User> GetAllUsers()
        {
            DbSet<User>? users = _dbContext.Users;
            if (users == null)
            {
                throw new Exception("No users found!");
            }
            return users;
        }

        public void Authenticate(AuthenticateBody authenticateBody, HttpContext httpContext)
        {
            string username = authenticateBody.Username ?? "";
            User? user = _userRepository.GetByUsername(username);
            if (user?.Password == null)
            {
                throw new InvalidCredentialException("Invalid username!");
            }

            string password = authenticateBody.Password ?? "";
            bool authenticated = _secretService.Verify(password, user.Password);
            if (!authenticated)
            {
                throw new InvalidCredentialException("Incorrect password!");
            }

            string token = _jwtUtils.GenerateToken(user);
            httpContext.Response.Cookies.Append(
                "Authorization",
                token,
                new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.None, // TODO: This should be able to be Strict in prod.
                    Secure = true
                });
        }

        public bool IsAuthenticated(HttpContext httpContext)
        {
            int? userId = _jwtUtils.ValidateTokenFromContext(httpContext);

            return userId != null;
        }
    }
}
