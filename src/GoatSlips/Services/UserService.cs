using GoatSlips.Constants;
using GoatSlips.DAL;
using GoatSlips.Exceptions;
using GoatSlips.Models;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using Google.Apis.Auth.OAuth2;
using MailKit.Security;
using System.Data.Entity;
using System.Security.Authentication;
using System.Security.Cryptography.X509Certificates;
using MailKit.Net.Smtp;
using MimeKit;
using System.Runtime;

namespace GoatSlips.Services
{
    public interface IUserService
    {
        IEnumerable<UserForDropdown> GetAllUsersForDropdown();
        Guid GenerateApiKey(HttpContext httpContext);
        void Authenticate(AuthenticateBody authenticateBody, HttpContext httpContext);
        Task<int> CreateUser(CreateUserBody createUserBody, bool requirePasswordChange);
        UserForUI? GetUserFromContext(HttpContext httpContext);
        bool AnyUsers();
        void Logout(HttpContext httpContext);
        void ChangePassword(ChangePasswordBody changePasswordBody, HttpContext httpContext);
        IEnumerable<AccessRight> GetAccessRightsForUser(int userId);
        void ValidateAccess(string accessRightCode, HttpContext httpContext);
        void ValidateAccessForProject(string accessRightCode, HttpContext httpContext, int projectId);
        IEnumerable<UserForManagement> QueryUsers(string? searchText);
        void SetUserAccessRights(int userId, HashSet<int> accessRightIds);
        void AddAdminAccessRightForUser(int userId);
    }
    public sealed class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISecretService _secretService;
        private readonly IJwtUtils _jwtUtils;
        private readonly IAccessRightRepository _accessRightRepository;
        private readonly IUserAccessRightRepository _userAccessRightRepository;
        private readonly IUserProjectRepository _userProjectRepository;
        private readonly IAppSettings _appSettings;

        public UserService(
            IUserRepository userRepository,
            ISecretService secretService,
            IJwtUtils jwtUtils,
            IAccessRightRepository accessRightRepository,
            IUserAccessRightRepository userAccessRightRepository,
            IUserProjectRepository userProjectRepository,
            IAppSettings appSettings
        )
        {
            _userRepository = userRepository;
            _secretService = secretService;
            _jwtUtils = jwtUtils;
            _accessRightRepository = accessRightRepository;
            _userAccessRightRepository = userAccessRightRepository;
            _userProjectRepository = userProjectRepository;
            _appSettings = appSettings;
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
                UserAccessRight[] accessRightLinks = userAccessRights.Where(userAccessRight => userAccessRight.UserId == user.Id).ToArray();
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

        public Guid GenerateApiKey(HttpContext httpContext)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);

            if (userId == null)
            {
                throw new Exception("No user in context.");
            }

            Guid apiKey = _userRepository.GenerateApiKey(userId.Value);

            return apiKey;
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

        public async Task<int> CreateUser(CreateUserBody createUserBody, bool requirePasswordChange)
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

            int userId = _userRepository.CreateUser(userToAdd);

            await SendNotificationOfAccountCreationEmail(createUserBody.Email);

            return userId;
        }

        private async System.Threading.Tasks.Task SendNotificationOfAccountCreationEmail(string createdUserEmailAddress)
        {
            if (!string.IsNullOrEmpty(_appSettings.SmtpHost) && !string.IsNullOrEmpty(_appSettings.SenderPassword) && !string.IsNullOrEmpty(_appSettings.SenderEmailAddress))
            {
                var emailMessage = new MimeMessage();

                emailMessage.From.Add(new MailboxAddress(_appSettings.SenderName, _appSettings.SenderEmailAddress));
                emailMessage.To.Add(new MailboxAddress("", createdUserEmailAddress));
                emailMessage.Subject = "G.O.A.T. Slips Account Created";
                emailMessage.Body = new TextPart("html") { Text = "A G.O.A.T. Slips account has been created for you." };

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(_appSettings.SmtpHost, _appSettings.SmtpPort, SecureSocketOptions.Auto);
                    await client.AuthenticateAsync(_appSettings.SenderEmailAddress, _appSettings.SenderPassword);

                    await client.SendAsync(emailMessage);
                    await client.DisconnectAsync(true);
                }
            }
        }

        public void AddAdminAccessRightForUser(int userId)
        {
            int adminId = _accessRightRepository.AccessRights.First(ar => ar.Code == AccessRights.Admin).Id;

            _userAccessRightRepository.AddAccessRightsForUser(userId, new HashSet<int> { adminId });
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
                    SameSite = SameSiteMode.Strict,
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

        public void ValidateAccessForProject(string accessRightCode, HttpContext httpContext, int projectId)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);
            if (!userId.HasValue)
            {
                throw new Exception("No user currently logged in!");
            }

            bool hasAccessRight = GetAccessRightsForUser(userId.Value).Any(ar => ar.Code == accessRightCode);
            bool canManageProject = _userProjectRepository.UserProjects.Any(up => up.UserId == userId && up.ProjectId == projectId);
            if (!hasAccessRight && !canManageProject)
            {
                throw new InsufficientAccessException("User does not have access to modify the project.");
            }
        }

        private void RemoveAccessRightsForUser(int userId, HashSet<int> accessRightIds)
        {
            DbSet<UserAccessRight> userAccessRightMapping = _userAccessRightRepository.UserAccessRights;

            UserAccessRight[] userAccessRightsToRemove = (from uar in userAccessRightMapping
                                                          where uar.UserId == userId &&
                                                          !accessRightIds.Contains(uar.AccessRightId)
                                                          select uar).ToArray();

            int adminAccessRightId = _accessRightRepository.AccessRights
                .Where(ar => ar.Code == AccessRights.Admin)
                .First().Id;

            bool anyOtherAdminUsers = _userAccessRightRepository.UserAccessRights
                .Any(uar => uar.AccessRightId == adminAccessRightId && uar.UserId != userId);
            if (!anyOtherAdminUsers)
            {
                throw new Exception("Cannot remove admin access right. No other users are admins.");
            }

            userAccessRightMapping.RemoveRange(userAccessRightsToRemove);
        }

        public void SetUserAccessRights(int userId, HashSet<int> accessRightIds)
        {
            DbSet<User> users = _userRepository.Users;

            if (!users.Any(p => p.Id == userId))
            {
                throw new Exception("User does not exist!");
            }

            DbSet<AccessRight> accessRights = _accessRightRepository.AccessRights;

            if (accessRightIds.Any(ar => !accessRights.Any(t => t.Id == ar)))
            {
                throw new Exception("Access right does not exist!");
            }

            DbSet<UserAccessRight> userAccessRightMapping = _userAccessRightRepository.UserAccessRights;

            RemoveAccessRightsForUser(userId, accessRightIds);

            _userAccessRightRepository.AddAccessRightsForUser(userId, accessRightIds);
        }
    }
}
