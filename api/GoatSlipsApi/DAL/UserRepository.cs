using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.DAL
{
    public interface IUserRepository
    {
        User? GetById(int id);
        User? GetByEmail(string email);
        IEnumerable<User> GetAllUsers();
        void CreateFirstUser(User userToAdd);
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

        public User? GetByEmail(string email)
        {
            return _dbContext.Users?.FirstOrDefault(u => u.Email == email);
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

        public void CreateFirstUser(User userToAdd)
        {
            _dbContext.Users?.Add(userToAdd);
            _dbContext.SaveChanges();
        }
    }
}
