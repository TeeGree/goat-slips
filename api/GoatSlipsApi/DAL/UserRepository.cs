using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.DAL
{
    public interface IUserRepository
    {
        User? GetById(int id);
        User? GetByUsername(string username);
        IEnumerable<UserForDropdown> GetAllUsers();
        void CreateUser(User userToAdd);
        void UpdatePassword(int userId, string newPassword);
    }
    public sealed class UserRepository : IUserRepository
    {
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

        public IEnumerable<UserForDropdown> GetAllUsers()
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

        public void CreateUser(User userToAdd)
        {
            _dbContext.Users?.Add(userToAdd);
            _dbContext.SaveChanges();
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
