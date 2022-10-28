using GoatSlipsApi.DAL;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.Services
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
        public LaborCodeService(
            ILaborCodeRepository laborCodeRepository,
            ITimeSlipRepository timeSlipRepository,
            IGoatSlipsContext dbContext
        )
        {
            _laborCodeRepository = laborCodeRepository;
            _timeSlipRepository = timeSlipRepository;
            _dbContext = dbContext;
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

            laborCodes.Remove(laborCode);

            _dbContext.SaveChanges();
        }
    }
}
