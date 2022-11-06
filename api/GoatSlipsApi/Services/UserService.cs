using GoatSlipsApi.DAL;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Api;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;
using System.Security.Authentication;

namespace GoatSlipsApi.Services
{
    public interface IUserService
    {
        IEnumerable<UserForDropdown> GetAllUsersForDropdown();
        void Authenticate(AuthenticateBody authenticateBody, HttpContext httpContext);
        void CreateUser(CreateUserBody createUserBody, bool requirePasswordChange);
        UserForUI? GetUserFromContext(HttpContext httpContext);
        bool AnyUsers();
        void Logout(HttpContext httpContext);
        void ChangePassword(ChangePasswordBody changePasswordBody, HttpContext httpContext);
        IEnumerable<AccessRight> GetAccessRightsForUser(int userId);
        void ValidateAccess(string accessRightCode, HttpContext httpContext);
        IEnumerable<UserForManagement> QueryUsers(string? searchText);
    }
    public sealed class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISecretService _secretService;
        private readonly IJwtUtils _jwtUtils;
        private readonly IAccessRightRepository _accessRightRepository;
        private readonly IUserAccessRightRepository _userAccessRightRepository;

        public UserService(
            IUserRepository userRepository,
            ISecretService secretService,
            IJwtUtils jwtUtils,
            IAccessRightRepository accessRightRepository,
            IUserAccessRightRepository userAccessRightRepository
        )
        {
            _userRepository = userRepository;
            _secretService = secretService;
            _jwtUtils = jwtUtils;
            _accessRightRepository = accessRightRepository;
            _userAccessRightRepository = userAccessRightRepository;
        }

        public IEnumerable<UserForDropdown> GetAllUsersForDropdown()
        {
            return _userRepository.GetAllUsersForDropdown();
        }

        public IEnumerable<UserForManagement> QueryUsers(string? searchText)
        {
            DbSet<User> users = _userRepository.Users;
            User[] filteredUsers;
            if (searchText == null)
            {
                filteredUsers = users.ToArray();
            }
            else
            {
                filteredUsers = users.Where(u =>
                    u.Username.StartsWith(searchText) ||
                    u.Email.StartsWith(searchText) ||
                    (u.FirstName != null && u.FirstName.StartsWith(searchText)) ||
                    (u.LastName != null && u.LastName.StartsWith(searchText))
                ).ToArray();
            }

            if (filteredUsers.Length == 0)
            {
                return Array.Empty<UserForManagement>();
            }

            DbSet<UserAccessRight> userAccessRights = _userAccessRightRepository.UserAccessRights;
            DbSet<AccessRight> accessRights = _accessRightRepository.AccessRights;

            IEnumerable<UserForManagement> userResults = filteredUsers.Select(user =>
            {
                IEnumerable<UserAccessRight> accessRightLinks = userAccessRights.Where(userAccessRight => userAccessRight.UserId == user.Id);
                IEnumerable<AccessRight> accessRightsForUser = from accessRightLink in accessRightLinks
                                                               join accessRight in accessRights
                                                                   on accessRightLink.AccessRightId equals accessRight.Id
                                                               select accessRight;
                var userResult = new UserForManagement
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    AccessRights = accessRightsForUser.ToArray()
                };

                return userResult;
            });
            
            return userResults;
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

        public void CreateUser(CreateUserBody createUserBody, bool requirePasswordChange)
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

            if (!_secretService.IsPasswordValid(createUserBody.Password))
            {
                throw new InvalidCredentialException("Password must be at least 8 characters long with at least one letter and at least one number.");
            }

            var userToAdd = new User
            {
                Username = createUserBody.Username,
                Email = createUserBody.Email,
                FirstName = createUserBody.FirstName,
                LastName = createUserBody.LastName,
                Password = _secretService.Hash(createUserBody.Password),
                RequirePasswordChange = requirePasswordChange,
            };

            _userRepository.CreateUser(userToAdd);
        }

        public UserForUI? GetUserFromContext(HttpContext httpContext)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);

            if (userId == null)
            {
                throw new Exception("No user in context.");
            }

            User? user = _userRepository.GetById(userId.Value);

            if (user == null)
            {
                throw new Exception("User in context not found in db.");
            }

            return new UserForUI
            {
                UserId = user.Id,
                Username = user.Username,
                RequiresPasswordChange = user.RequirePasswordChange,
            };
        }

        public bool AnyUsers()
        {
            return _userRepository.Users.Any();
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

            if (!_secretService.IsPasswordValid(newPassword))
            {
                throw new InvalidCredentialException("New password must be at least 8 characters long with at least one letter and at least one number.");
            }

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

        public IEnumerable<AccessRight> GetAccessRightsForUser(int userId)
        {
            DbSet<UserAccessRight> userAccessRights = _userAccessRightRepository.UserAccessRights;

            DbSet<AccessRight> accessRights = _accessRightRepository.AccessRights;

            return from userAccessRight in userAccessRights
                   join accessRight in accessRights
                       on userAccessRight.AccessRightId equals accessRight.Id
                   where userAccessRight.UserId == userId
                   select accessRight;
        }

        public void ValidateAccess(string accessRightCode, HttpContext httpContext)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);
            if (!userId.HasValue)
            {
                throw new Exception("No user currently logged in!");
            }

            bool hasAccess = GetAccessRightsForUser(userId.Value).Any(ar => ar.Code == accessRightCode);
            if (!hasAccess)
            {
                throw new InsufficientAccessException("User does not have the required access right.");
            }
        }
    }
}
