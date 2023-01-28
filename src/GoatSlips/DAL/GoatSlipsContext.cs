using GoatSlips.Models;
using GoatSlips.Models.Database;
using GoatSlips.Models.Database.Query;
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
        DbSet<Query>? Queries { get; set; }
        DbSet<QueryUser>? QueryUsers { get; set; }
        DbSet<QueryProject>? QueryProjects { get; set; }
        DbSet<QueryTask>? QueryTasks { get; set; }
        DbSet<QueryLaborCode>? QueryLaborCodes { get; set; }
        DbSet<TimeSlipConfiguration>? TimeSlipConfigurations { get; set; }
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
        public DbSet<Query>? Queries { get; set; }
        public DbSet<QueryUser>? QueryUsers { get; set; }
        public DbSet<QueryProject>? QueryProjects { get; set; }
        public DbSet<QueryTask>? QueryTasks { get; set; }
        public DbSet<QueryLaborCode>? QueryLaborCodes { get; set; }
        public DbSet<TimeSlipConfiguration>? TimeSlipConfigurations { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}
