using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.DAL
{
    public interface IUserAccessRightRepository
    {
        DbSet<UserAccessRight> UserAccessRights { get; }
    }
    public sealed class UserAccessRightRepository : IUserAccessRightRepository
    {
        public DbSet<UserAccessRight> UserAccessRights
        {
            get
            {
                DbSet<UserAccessRight>? userAccessRights = _dbContext.UserAccessRights;
                if (userAccessRights == null)
                {
                    throw new Exception("No user access rights found!");
                }
                return userAccessRights;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public UserAccessRightRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
