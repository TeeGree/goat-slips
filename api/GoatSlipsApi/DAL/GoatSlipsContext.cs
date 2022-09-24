using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace GoatSlipsApi.DAL
{
    public interface IGoatSlipsContext
    {
        DbSet<LaborCode>? LaborCodes { get; set; }
        DbSet<Project>? Projects { get; set; }
        DbSet<ProjectTask>? ProjectTasks { get; set; }
        DbSet<Models.Database.Task>? Tasks { get; set; }
        DbSet<TimeSlip>? TimeSlips { get; set; }
        DbSet<User>? Users { get; set; }
    }
    public class GoatSlipsContext : DbContext, IGoatSlipsContext
    {
        public GoatSlipsContext(IAppSettings appSettings): base(appSettings.ConnectionString) { }

        public DbSet<LaborCode>? LaborCodes { get; set; }
        public DbSet<Project>? Projects { get; set; }
        public DbSet<ProjectTask>? ProjectTasks { get; set; }
        public DbSet<Models.Database.Task>? Tasks { get; set; }
        public DbSet<TimeSlip>? TimeSlips { get; set; }
        public DbSet<User>? Users { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}
