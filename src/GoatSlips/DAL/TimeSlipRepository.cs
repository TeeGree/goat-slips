using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using System.Data.Entity;
using System.Data.Entity.Migrations;

namespace GoatSlips.DAL
{
    public interface ITimeSlipRepository
    {
        DbSet<TimeSlip> TimeSlips { get; }
        void ClearTaskIdsForTimeSlips(int projectId, IEnumerable<int> taskIds, int userId);
        void DeleteTimeSlip(int timeSlipId, int userId);
        void AddTimeSlips(List<TimeSlip> timeSlips, int userId);
        void UpdateTimeSlip(UpdateTimeSlipBody timeSlip, int userId);
    }
    public sealed class TimeSlipRepository : ITimeSlipRepository
    {
        public DbSet<TimeSlip> TimeSlips
        {
            get
            {
                DbSet<TimeSlip>? timeSlips = _dbContext.TimeSlips;
                if (timeSlips == null)
                {
                    throw new Exception("No time slips found!");
                }
                return timeSlips;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        private readonly ITimeSlipLogRepository _timeSlipLogRepository;

        public TimeSlipRepository(IGoatSlipsContext dbContext, ITimeSlipLogRepository timeSlipLogRepository)
        {
            _dbContext = dbContext;
            _timeSlipLogRepository = timeSlipLogRepository;
        }

        public void ClearTaskIdsForTimeSlips(int projectId, IEnumerable<int> taskIds, int userId)
        {
            TimeSlip[] projectTimeSlips = TimeSlips.Where(ts => ts.ProjectId == projectId).ToArray();

            TimeSlip[] timeSlipsToClearTaskIds = projectTimeSlips.Where(ts =>
                taskIds.Any(id => id == ts.TaskId)
            ).ToArray();

            foreach (TimeSlip timeSlip in timeSlipsToClearTaskIds)
            {
                timeSlip.TaskId = null;
                _timeSlipLogRepository.TimeSlipLogs.Add(new TimeSlipLog
                {
                    TimeSlipId = timeSlip.Id,
                    OldHours = timeSlip.Hours,
                    OldMinutes = timeSlip.Minutes,
                    OldDate = timeSlip.Date,
                    OldUserId = timeSlip.UserId,
                    OldDescription = timeSlip.Description,
                    OldLaborCodeId = timeSlip.LaborCodeId,
                    OldProjectId = timeSlip.ProjectId,
                    OldTaskId = timeSlip.TaskId,
                    NewHours = timeSlip.Hours,
                    NewMinutes = timeSlip.Minutes,
                    NewDate = timeSlip.Date,
                    NewUserId = timeSlip.UserId,
                    NewDescription = timeSlip.Description,
                    NewLaborCodeId = timeSlip.LaborCodeId,
                    NewProjectId = timeSlip.ProjectId,
                    NewTaskId = timeSlip.TaskId,
                    TimeStamp = DateTime.Now,
                    UpdateUserId = userId,
                    UpdateType = "U"
                });
                TimeSlips.AddOrUpdate(timeSlip);
            }

            _dbContext.SaveChanges();
        }

        public void DeleteTimeSlip(int timeSlipId, int userId)
        {
            TimeSlip? timeSlip = _dbContext.TimeSlips?.First(ts => ts.Id == timeSlipId);
            if (timeSlip == null)
            {
                throw new Exception("Time slip not found!");
            }

            _timeSlipLogRepository.TimeSlipLogs.Add(new TimeSlipLog
            {
                TimeSlipId = timeSlip.Id,
                OldHours = timeSlip.Hours,
                OldMinutes = timeSlip.Minutes,
                OldDate = timeSlip.Date,
                OldUserId = timeSlip.UserId,
                OldDescription = timeSlip.Description,
                OldLaborCodeId = timeSlip.LaborCodeId,
                OldProjectId = timeSlip.ProjectId,
                OldTaskId = timeSlip.TaskId,
                TimeStamp = DateTime.Now,
                UpdateUserId = userId,
                UpdateType = "D"
            });
            _dbContext.TimeSlips?.Remove(timeSlip);
            _dbContext.SaveChanges();
        }

        public void AddTimeSlips(List<TimeSlip> timeSlips, int userId)
        {
            IEnumerable<TimeSlip> addedTimeSlips = TimeSlips.AddRange(timeSlips);

            _dbContext.SaveChanges();
            IEnumerable<TimeSlipLog> timeSlipLogs = addedTimeSlips.Select(ts => new TimeSlipLog
            {
                TimeSlipId = ts.Id,
                NewHours = ts.Hours,
                NewMinutes = ts.Minutes,
                NewDate = ts.Date,
                NewUserId = ts.UserId,
                NewDescription = ts.Description,
                NewLaborCodeId = ts.LaborCodeId,
                NewProjectId = ts.ProjectId,
                NewTaskId = ts.TaskId,
                TimeStamp = DateTime.Now,
                UpdateUserId = userId,
                UpdateType = "C"
            });
            _timeSlipLogRepository.TimeSlipLogs.AddRange(timeSlipLogs);
            _dbContext.SaveChanges();
        }

        public void UpdateTimeSlip(UpdateTimeSlipBody timeSlip, int userId)
        {
            TimeSlip? timeSlipFromDb = TimeSlips.First(ts => ts.Id == timeSlip.TimeSlipId);
            if (timeSlipFromDb == null)
            {
                throw new Exception("Time slip not found!");
            }

            _timeSlipLogRepository.TimeSlipLogs.Add(new TimeSlipLog
            {
                TimeSlipId = timeSlip.TimeSlipId,
                OldHours = timeSlip.Hours,
                OldMinutes = timeSlip.Minutes,
                OldDate = timeSlipFromDb.Date,
                OldUserId = timeSlipFromDb.UserId,
                OldDescription = timeSlip.Description,
                OldLaborCodeId = timeSlip.LaborCodeId,
                OldProjectId = timeSlip.ProjectId,
                OldTaskId = timeSlip.TaskId,
                NewHours = timeSlipFromDb.Hours,
                NewMinutes = timeSlipFromDb.Minutes,
                NewDate = timeSlipFromDb.Date,
                NewUserId = timeSlipFromDb.UserId,
                NewDescription = timeSlipFromDb.Description,
                NewLaborCodeId = timeSlipFromDb.LaborCodeId,
                NewProjectId = timeSlipFromDb.ProjectId,
                NewTaskId = timeSlipFromDb.TaskId,
                TimeStamp = DateTime.Now,
                UpdateUserId = userId,
                UpdateType = "U"
            });

            timeSlipFromDb.Hours = timeSlip.Hours;
            timeSlipFromDb.Minutes = timeSlip.Minutes;
            timeSlipFromDb.ProjectId = timeSlip.ProjectId;
            timeSlipFromDb.TaskId = timeSlip.TaskId;
            timeSlipFromDb.LaborCodeId = timeSlip.LaborCodeId;
            timeSlipFromDb.Description = timeSlip.Description;

            _dbContext.SaveChanges();
        }
    }
}
