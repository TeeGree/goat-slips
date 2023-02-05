using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.DAL
{
    public interface IUserProjectRepository
    {
        DbSet<UserProject> UserProjects { get; }
        IEnumerable<UserProject> GetUserProjects(int? userId = null);
        void SetUserProjects(int userId, HashSet<int> projectIds);
        void ReleaseProjectId(int projectId);
    }
    public sealed class UserProjectRepository : IUserProjectRepository
    {
        public DbSet<UserProject> UserProjects
        {
            get
            {
                DbSet<UserProject>? userProjects = _dbContext.UserProjects;
                if (userProjects == null)
                {
                    throw new Exception("No user projects found!");
                }
                return userProjects;
            }
        }

        private readonly IGoatSlipsContext _dbContext;

        public UserProjectRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public IEnumerable<UserProject> GetUserProjects(int? userId = null)
        {
            if (userId == null)
            {
                return UserProjects;
            }

            return UserProjects.Where(up => up.UserId == userId);
        }

        public void SetUserProjects(int userId, HashSet<int> projectIds)
        {
            IEnumerable<UserProject> userProjects = UserProjects.Where(up => up.UserId == userId);

            HashSet<int> existingProjectIds = userProjects.Select(up => up.ProjectId).ToHashSet();

            IEnumerable<UserProject> toRemove = userProjects.Where(up => !projectIds.Contains(up.ProjectId));
            IEnumerable<UserProject> toAdd = projectIds.Where(id => !existingProjectIds.Contains(id)).Select(id =>
            {
                return new UserProject
                {
                    UserId = userId,
                    ProjectId = id
                };
            });

            UserProjects.RemoveRange(toRemove);
            UserProjects.AddRange(toAdd);

            _dbContext.SaveChanges();
        }

        public void ReleaseProjectId(int projectId)
        {
            IEnumerable<UserProject> toRemove = UserProjects.Where(up => up.ProjectId == projectId);

            UserProjects.RemoveRange(toRemove);

            _dbContext.SaveChanges();
        }
    }
}
