using GoatSlips.Models;
using GoatSlips.Models.Database;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace GoatSlips.DAL
{
    public interface IGoatSlipsContext
    {
        DbSet<LaborCode>? LaborCodes { get; set; }
        DbSet<Project>? Projects { get; set; }
        DbSet<ProjectTask>? ProjectTasks { get; set; }
        DbSet<Models.Database.Task>? Tasks { get; set; }
        DbSet<TimeSlip>? TimeSlips { get; set; }
        DbSet<User>? Users { get; set; }
        DbSet<AccessRight>? AccessRights { get; set; }
        DbSet<UserAccessRight>? UserAccessRights { get; set; }
        DbSet<FavoriteTimeSlip>? FavoriteTimeSlips { get; set; }
        int SaveChanges();
    }
    public sealed class GoatSlipsContext : DbContext, IGoatSlipsContext
    {
        public GoatSlipsContext(IAppSettings appSettings): base(appSettings.ConnectionString) { }

        public DbSet<LaborCode>? LaborCodes { get; set; }
        public DbSet<Project>? Projects { get; set; }
        public DbSet<ProjectTask>? ProjectTasks { get; set; }
        public DbSet<Models.Database.Task>? Tasks { get; set; }
        public DbSet<TimeSlip>? TimeSlips { get; set; }
        public DbSet<User>? Users { get; set; }
        public DbSet<AccessRight>? AccessRights { get; set; }
        public DbSet<UserAccessRight>? UserAccessRights { get; set; }
        public DbSet<FavoriteTimeSlip>? FavoriteTimeSlips { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}
