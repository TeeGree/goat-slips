using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.DAL
{
    public interface IAccessRightRepository
    {
        DbSet<AccessRight> AccessRights { get; }
    }
    public sealed class AccessRightRepository : IAccessRightRepository
    {
        public DbSet<AccessRight> AccessRights
        {
            get
            {
                DbSet<AccessRight>? accessRights = _dbContext.AccessRights;
                if (accessRights == null)
                {
                    throw new Exception("No access rights found!");
                }
                return accessRights;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public AccessRightRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
