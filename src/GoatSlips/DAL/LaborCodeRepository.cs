using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.DAL
{
    public interface ILaborCodeRepository
    {
        DbSet<LaborCode> LaborCodes { get; }
    }
    public sealed class LaborCodeRepository : ILaborCodeRepository
    {
        public DbSet<LaborCode> LaborCodes
        {
            get
            {
                DbSet<LaborCode>? laborCodes = _dbContext.LaborCodes;
                if (laborCodes == null)
                {
                    throw new Exception("No labor codes found!");
                }
                return laborCodes;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public LaborCodeRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
