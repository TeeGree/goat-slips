using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Api;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.Services
{
    public interface ITimeSlipService
    {
        IEnumerable<TimeSlip> GetAllTimeSlips();
        TimeSlip[] GetWeekOfTimeSlipsForCurrentUser(DateTime weekDate, HttpContext httpContext);
        void AddTimeSlip(AddTimeSlipBody timeSlip, HttpContext httpContext);
        void UpdateTimeSlip(UpdateTimeSlipBody timeSlip);
        void DeleteTimeSlip(int id);
        TimeSlip[] GetTimeSlips(
            int[]? userIds,
            int[]? projectIds,
            int?[]? taskIds,
            int?[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        );
    }
    public class TimeSlipService : ITimeSlipService
    {
        private readonly IGoatSlipsContext _dbContext;
        private readonly ITimeSlipRepository _timeSlipRepository;

        public TimeSlipService(IGoatSlipsContext dbContext, ITimeSlipRepository timeSlipRepository)
        {
            _dbContext = dbContext;
            _timeSlipRepository = timeSlipRepository;
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

        public void AddTimeSlip(AddTimeSlipBody timeSlip, HttpContext httpContext)
        {
            User? user = httpContext.Items["User"] as User;
            if (user == null)
            {
                throw new Exception("No user logged in!");
            }

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;
            bool isDuplicateTimeSlip = timeSlips.Any(ts =>
                ts.UserId == user.Id &&
                ts.ProjectId == timeSlip.ProjectId &&
                ts.TaskId == timeSlip.TaskId &&
                ts.LaborCodeId == timeSlip.LaborCodeId &&
                ts.Date == timeSlip.Date.Date
            );
            if (isDuplicateTimeSlip)
            {
                throw new Exception("Time slip already exists for this date and combination of time codes!");
            }

            var timeSlipToAdd = new TimeSlip
            {
                Hours = timeSlip.Hours,
                Minutes = timeSlip.Minutes,
                Date = timeSlip.Date,
                ProjectId = timeSlip.ProjectId,
                TaskId = timeSlip.TaskId,
                LaborCodeId = timeSlip.LaborCodeId,
                UserId = user.Id
            };

            timeSlips.Add(timeSlipToAdd);
            _dbContext.SaveChanges();
        }

        public void UpdateTimeSlip(UpdateTimeSlipBody timeSlip)
        {
            TimeSlip? timeSlipFromDb = _dbContext.TimeSlips?.First(ts => ts.Id == timeSlip.TimeSlipId);
            if (timeSlipFromDb == null)
            {
                throw new Exception("Time slip not found!");
            }

            timeSlipFromDb.Hours = timeSlip.Hours;
            timeSlipFromDb.Minutes = timeSlip.Minutes;
            timeSlipFromDb.ProjectId = timeSlip.ProjectId;
            timeSlipFromDb.TaskId = timeSlip.TaskId;
            timeSlipFromDb.LaborCodeId = timeSlip.LaborCodeId;

            _dbContext.SaveChanges();
        }

        public void DeleteTimeSlip(int id)
        {
            TimeSlip? timeSlip = _dbContext.TimeSlips?.First(ts => ts.Id == id);
            if (timeSlip == null)
            {
                throw new Exception("Time slip not found!");
            }

            _dbContext.TimeSlips?.Remove(timeSlip);
            _dbContext.SaveChanges();
        }

        public TimeSlip[] GetTimeSlips(
            int[]? userIds,
            int[]? projectIds,
            int?[]? taskIds,
            int?[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            // TODO: Allow selecting blank
            DbSet<TimeSlip>? timeSlips = _dbContext?.TimeSlips;
            if (timeSlips == null)
            {
                throw new Exception("No time slips found!");
            }

            IQueryable<TimeSlip> timeSlipsQueryable = timeSlips.AsQueryable();

            if (userIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => userIds.Contains(ts.UserId));
            }

            if (projectIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => projectIds.Contains(ts.ProjectId));
            }

            if (taskIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => taskIds.Contains(ts.TaskId));
            }

            if (laborCodeIds != null)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => laborCodeIds.Contains(ts.LaborCodeId));
            }

            if (fromDate.HasValue)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => ts.Date >= fromDate);
            }

            if (toDate.HasValue)
            {
                timeSlipsQueryable = timeSlipsQueryable.Where(ts => ts.Date <= toDate);
            }

            return timeSlipsQueryable.ToArray();
        }
    }
}
