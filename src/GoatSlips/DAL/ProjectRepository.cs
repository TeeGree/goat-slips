using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.DAL
{
    public interface IProjectRepository
    {
        DbSet<Project> Projects { get; }
        Dictionary<int, decimal> GetProjectRates();
    }
    public sealed class ProjectRepository : IProjectRepository
    {
        public DbSet<Project> Projects
        {
            get
            {
                DbSet<Project>? projects = _dbContext.Projects;
                if (projects == null)
                {
                    throw new Exception("No projects found!");
                }
                return projects;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public ProjectRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public Dictionary<int, decimal> GetProjectRates()
        {
            return Projects.ToDictionary(p => p.Id, p => p.Rate);
        }
    }
}
