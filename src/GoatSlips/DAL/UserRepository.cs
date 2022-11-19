using GoatSlips.Models;
using GoatSlips.Models.Database;
using System.Data.Entity;

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
        public UserRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
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
    }
}
