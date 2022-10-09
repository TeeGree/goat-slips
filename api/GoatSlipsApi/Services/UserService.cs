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
        string? GetUsernameFromContext(HttpContext httpContext);
        bool AnyUsers();
        void Logout(HttpContext httpContext);
        void ChangePassword(ChangePasswordBody changePasswordBody, HttpContext httpContext);
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
            SetAuthorizationCookie(token, httpContext);
        }

        public void CreateUser(CreateUserBody createUserBody)
        {
            if (string.IsNullOrEmpty(createUserBody.Username))
            {
                throw new ArgumentNullException("An username must be supplied for a new user.");
            }

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
                Username = createUserBody.Username,
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

        public string? GetUsernameFromContext(HttpContext httpContext)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);

            if (userId == null)
            {
                return null;
            }

            User? user = _userRepository.GetById(userId.Value);

            if (user != null)
            {
                return user.Username;
            }

            return null;
        }

        public bool AnyUsers()
        {
            return _userRepository.GetAllUsers().Count() > 0;
        }

        public void Logout(HttpContext httpContext)
        {
            SetAuthorizationCookie(string.Empty, httpContext, -1);
        }

        public void ChangePassword(ChangePasswordBody changePasswordBody, HttpContext httpContext)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);
            if (userId == null)
            {
                throw new Exception("No user currently logged in!");
            }

            User? user = GetUserById(userId.Value);

            string oldPassword = changePasswordBody.OldPassword ?? "";
            bool authenticated = _secretService.Verify(oldPassword, user.Password);
            if (!authenticated)
            {
                throw new InvalidCredentialException("Incorrect password!");
            }

            string newPassword = changePasswordBody.NewPassword ?? "";
            string newPasswordHash = _secretService.Hash(newPassword);
            _userRepository.UpdatePassword(userId.Value, newPasswordHash);

            user = GetUserById(userId.Value);

            string token = _jwtUtils.GenerateToken(user);
            SetAuthorizationCookie(token, httpContext);
        }

        private User GetUserById(int userId)
        {
            User? user = _userRepository.GetById(userId);
            if (user?.Password == null)
            {
                throw new Exception("Invalid username!");
            }

            return user;
        }

        private void SetAuthorizationCookie(string token, HttpContext httpContext, int expirationDays = 1)
        {
            httpContext.Response.Cookies.Append(
                "Authorization",
                token,
                new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.None, // TODO: This should be able to be Strict in prod.
                    Secure = true,
                    Expires = DateTime.Now.AddDays(expirationDays)
                });
        }
    }
}
