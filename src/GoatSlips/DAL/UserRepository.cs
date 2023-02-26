using GoatSlips.Models;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using System.Data.Entity;
using System.Data.Entity.Migrations;

namespace GoatSlips.DAL
{
    public interface IUserRepository
    {
        DbSet<User> Users { get; }
        User? GetById(int id);
        User? GetByUsername(string username);
        IEnumerable<UserForDropdown> GetAllUsersForDropdown();
        int CreateUser(User userToAdd);
        void UpdatePassword(int userId, string newPassword);
        Guid GenerateApiKey(int userId);
        User? GetUserForApiKey(string apiKey);
    }
    public sealed class UserRepository : IUserRepository
    {
        public DbSet<User> Users
        {
            get
            {
                DbSet<User>? users = _dbContext.Users;
                if (users == null)
                {
                    throw new Exception("No users found!");
                }
                return users;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        private readonly ISecretService _secretService;

        public UserRepository(IGoatSlipsContext dbContext, ISecretService secretService)
        {
            _dbContext = dbContext;
            _secretService = secretService;
        }

        public User? GetById(int id)
        {
            return _dbContext.Users?.FirstOrDefault(u => u.Id == id);
        }

        public User? GetByUsername(string username)
        {
            return _dbContext.Users?.FirstOrDefault(u => u.Username == username);
        }

        public IEnumerable<UserForDropdown> GetAllUsersForDropdown()
        {
            DbSet<User>? users = _dbContext.Users;
            if (users == null)
            {
                throw new Exception("No users found!");
            }
            return users.Select(u => new UserForDropdown
            {
                Id = u.Id,
                Name = u.Username
            });
        }

        public int CreateUser(User userToAdd)
        {
            User addedUser = Users.Add(userToAdd);
            _dbContext.SaveChanges();
            return addedUser.Id;
        }

        public void UpdatePassword(int userId, string newPassword)
        {
            User? userFromDb = _dbContext.Users?.First(u => u.Id == userId);
            if (userFromDb == null)
            {
                throw new Exception("User not found!");
            }

            userFromDb.Password = newPassword;
            userFromDb.RequirePasswordChange = false;

            _dbContext.SaveChanges();
        }

        public Guid GenerateApiKey(int userId)
        {
            User? userFromDb = _dbContext.Users?.First(u => u.Id == userId);
            if (userFromDb == null)
            {
                throw new Exception("User not found!");
            }

            Guid apiKey = Guid.NewGuid();
            string apiKeyHash = _secretService.Hash(apiKey.ToString());
            userFromDb.ApiKey = apiKeyHash;
            Users.AddOrUpdate(userFromDb);

            _dbContext.SaveChanges();

            return apiKey;
        }

        public User? GetUserForApiKey(string apiKey)
        {
            User? user = Users.ToArray().FirstOrDefault(u => u.ApiKey != null && _secretService.Verify(apiKey, u.ApiKey));

            return user;
        }
    }
}
