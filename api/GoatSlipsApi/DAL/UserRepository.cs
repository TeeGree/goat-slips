using GoatSlipsApi.Models.Database;

namespace GoatSlipsApi.DAL
{
    public interface IUserRepository
    {
        User? GetById(int id);
        User? GetByUsername(string username);
    }
    public sealed class UserRepository : IUserRepository
    {
        private readonly IGoatSlipsContext _goatSlipsContext;
        public UserRepository(IGoatSlipsContext goatSlipsContext)
        {
            _goatSlipsContext = goatSlipsContext;
        }

        public User? GetById(int id)
        {
            return _goatSlipsContext.Users?.FirstOrDefault(u => u.Id == id);
        }

        public User? GetByUsername(string username)
        {
            return _goatSlipsContext.Users?.FirstOrDefault(u => u.Username == username);
        }
    }
}
