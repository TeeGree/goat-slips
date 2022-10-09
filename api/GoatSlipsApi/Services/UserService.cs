using GoatSlipsApi.DAL;
using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using System.Security.Authentication;

namespace GoatSlipsApi.Services
{
    public interface IUserService
    {
        IEnumerable<User> GetAllUsers();
        void Authenticate(AuthenticateBody authenticateBody, HttpContext httpContext);
        void CreateUser(CreateUserBody createUserBody);
        void CreateFirstUser(CreateUserBody createUserBody);
        bool IsAuthenticated(HttpContext httpContext);
        bool AnyUsers();
        void Logout(HttpContext httpContext);
    }
    public sealed class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISecretService _secretService;
        private readonly IJwtUtils _jwtUtils;
        public UserService(
            IUserRepository userRepository,
            ISecretService secretService,
            IJwtUtils jwtUtils)
        {
            _userRepository = userRepository;
            _secretService = secretService;
            _jwtUtils = jwtUtils;
        }

        public IEnumerable<User> GetAllUsers()
        {
            return _userRepository.GetAllUsers();
        }

        public void Authenticate(AuthenticateBody authenticateBody, HttpContext httpContext)
        {
            string email = authenticateBody.Email ?? "";
            User? user = _userRepository.GetByEmail(email);
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
                    Secure = true,
                    Expires = DateTime.Now.AddDays(1)
                });
        }

        public void CreateUser(CreateUserBody createUserBody)
        {
            if (string.IsNullOrEmpty(createUserBody.Email))
            {
                throw new ArgumentNullException("An email must be supplied for a new user.");
            }

            if (string.IsNullOrEmpty(createUserBody.Password))
            {
                throw new ArgumentNullException("An password must be supplied for a new user.");
            }

            var userToAdd = new User
            {
                Email = createUserBody.Email,
                FirstName = createUserBody.FirstName,
                LastName = createUserBody.LastName,
                Password = _secretService.Hash(createUserBody.Password),
            };

            _userRepository.CreateFirstUser(userToAdd);
        }

        public void CreateFirstUser(CreateUserBody createUserBody)
        {
            CreateUser(createUserBody);
        }

        public bool IsAuthenticated(HttpContext httpContext)
        {
            int? userId = _jwtUtils.ValidateTokenFromContext(httpContext);

            return userId != null;
        }

        public bool AnyUsers()
        {
            return _userRepository.GetAllUsers().Count() > 0;
        }

        public void Logout(HttpContext httpContext)
        {
            httpContext.Response.Cookies.Append(
                "Authorization",
                "",
                new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.None, // TODO: This should be able to be Strict in prod.
                    Secure = true,
                    Expires = DateTime.Now.AddDays(-1)
                });
        }
    }
}
