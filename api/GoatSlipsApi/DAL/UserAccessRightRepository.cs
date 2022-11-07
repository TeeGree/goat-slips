using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.DAL
{
    public interface IUserAccessRightRepository
    {
        DbSet<UserAccessRight> UserAccessRights { get; }
        void AddAccessRightsForUser(int userId, HashSet<int> accessRightIds);
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

        public void AddAccessRightsForUser(int userId, HashSet<int> accessRightIds)
        {
            int[] accessRightIdsToAdd = accessRightIds.Where(accessRightId =>
                !UserAccessRights.Any(
                    pt => pt.UserId == userId&&
                    pt.AccessRightId == accessRightId
                )
            ).ToArray();

            UserAccessRight[] userAccessRightToAdd = accessRightIdsToAdd.Select(accessRightId => new UserAccessRight
            {
                UserId = userId,
                AccessRightId = accessRightId
            }).ToArray();

            UserAccessRights.AddRange(userAccessRightToAdd);

            _dbContext.SaveChanges();
        }
    }
}
