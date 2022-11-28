using GoatSlips.DAL;
using GoatSlips.Exceptions;
using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.Services
{
    public interface ILaborCodeService
    {
        void CreateLaborCode(string laborCodeName);
        void DeleteLaborCode(int laborCodeId);
    }
    public sealed class LaborCodeService : ILaborCodeService
    {
        private readonly ILaborCodeRepository _laborCodeRepository;
        private readonly ITimeSlipRepository _timeSlipRepository;
        private readonly IGoatSlipsContext _dbContext;
        private readonly IFavoriteTimeSlipRepository _favoriteTimeSlipRepository;

        public LaborCodeService(
            ILaborCodeRepository laborCodeRepository,
            ITimeSlipRepository timeSlipRepository,
            IGoatSlipsContext dbContext,
            IFavoriteTimeSlipRepository favoriteTimeSlipRepository
        )
        {
            _laborCodeRepository = laborCodeRepository;
            _timeSlipRepository = timeSlipRepository;
            _dbContext = dbContext;
            _favoriteTimeSlipRepository = favoriteTimeSlipRepository;
        }

        public void CreateLaborCode(string laborCodeName)
        {
            DbSet<LaborCode> laborCodes = _laborCodeRepository.LaborCodes;

            laborCodes.Add(new LaborCode
            {
                Name = laborCodeName
            });

            _dbContext.SaveChanges();
        }

        public void DeleteLaborCode(int laborCodeId)
        {
            DbSet<LaborCode> laborCodes = _laborCodeRepository.LaborCodes;

            var laborCode = laborCodes.FirstOrDefault(p => p.Id == laborCodeId);

            if (laborCode == null)
            {
                throw new Exception("Labor code does not exist!");
            }

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

            if (timeSlips.Any(ts => ts.LaborCodeId == laborCodeId))
            {
                throw new CodeInUseException("Labor code is in use!");
            }

            // Delete user favorites that include this labor code.
            DbSet<FavoriteTimeSlip> favoriteTimeSlips = _favoriteTimeSlipRepository.FavoriteTimeSlips;
            IEnumerable<FavoriteTimeSlip> favoritesToDelete = favoriteTimeSlips.Where(fts => fts.LaborCodeId == laborCodeId);
            favoriteTimeSlips.RemoveRange(favoritesToDelete);

            _dbContext.SaveChanges();


            laborCodes.Remove(laborCode);

            _dbContext.SaveChanges();
        }
    }
}
