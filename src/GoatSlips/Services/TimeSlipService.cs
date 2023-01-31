using GoatSlips.DAL;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.Services
{
    public interface ITimeSlipService
    {
        IEnumerable<TimeSlip> GetAllTimeSlips();
        TimeSlip[] GetWeekOfTimeSlipsForCurrentUser(DateTime weekDate, HttpContext httpContext);
        void AddTimeSlip(AddTimeSlipBody timeSlip, HttpContext httpContext);
        void UpdateTimeSlip(UpdateTimeSlipBody timeSlip, int userId);
        void DeleteTimeSlip(int timeSlipId, int userId);
    }
    public class TimeSlipService : ITimeSlipService
    {
        private readonly ITimeSlipRepository _timeSlipRepository;
        private readonly ITimeSlipConfigurationRepository _timeSlipConfigurationRepository;

        public TimeSlipService(
            ITimeSlipRepository timeSlipRepository,
            ITimeSlipConfigurationRepository timeSlipConfigurationRepository
        )
        {
            _timeSlipRepository = timeSlipRepository;
            _timeSlipConfigurationRepository = timeSlipConfigurationRepository;
        }

        public IEnumerable<TimeSlip> GetAllTimeSlips()
        {
            return _timeSlipRepository.TimeSlips;
        }

        public TimeSlip[] GetWeekOfTimeSlipsForCurrentUser(DateTime weekDate, HttpContext httpContext)
        {
            User? user = httpContext.Items["User"] as User;
            if (user == null)
            {
                throw new Exception("No user logged in!");
            }

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

            var endDate = weekDate.AddDays(7);
            return timeSlips.Where(ts =>
                ts.UserId == user.Id &&
                ts.Date >= weekDate &&
                ts.Date < endDate
            ).ToArray();
        }

        private void ValidateMinutes(byte minutes)
        {
            byte minutesPartition = _timeSlipConfigurationRepository.GetMinutesPartition();
            if (minutes % minutesPartition != 0)
            {
                throw new Exception("The minutes for the time slip is not valid according to the system's minute partition configuration.");
            }
        }

        public void AddTimeSlip(AddTimeSlipBody timeSlip, HttpContext httpContext)
        {
            User? user = httpContext.Items["User"] as User;
            if (user == null)
            {
                throw new Exception("No user logged in!");
            }

            ValidateMinutes(timeSlip.Minutes);

            IEnumerable<TimeSlip> timeSlipsToAdd = from date in timeSlip.Dates
                                                   select new TimeSlip
                                                   {
                                                       Hours = timeSlip.Hours,
                                                       Minutes = timeSlip.Minutes,
                                                       Date = date,
                                                       ProjectId = timeSlip.ProjectId,
                                                       TaskId = timeSlip.TaskId,
                                                       LaborCodeId = timeSlip.LaborCodeId,
                                                       Description = timeSlip.Description,
                                                       UserId = user.Id
                                                   };

            _timeSlipRepository.AddTimeSlips(timeSlipsToAdd.ToList(), user.Id);
        }

        public void UpdateTimeSlip(UpdateTimeSlipBody timeSlip, int userId)
        {
            ValidateMinutes(timeSlip.Minutes);

            _timeSlipRepository.UpdateTimeSlip(timeSlip, userId);
        }

        public void DeleteTimeSlip(int timeSlipId, int userId)
        {
            _timeSlipRepository.DeleteTimeSlip(timeSlipId, userId);
        }
    }
}
