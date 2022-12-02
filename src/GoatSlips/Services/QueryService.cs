using GoatSlips.Constants;
using GoatSlips.DAL;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using System.Data.Entity;

namespace GoatSlips.Services
{
    public interface IQueryService
    {
        IEnumerable<Query> GetQueries(HttpContext httpContext);
        TimeSlip[] QueryTimeSlips(GetTimeSlipsBody getTimeSlipsBody, HttpContext httpContext);
        void AddQuery(
            string name,
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
            DateTime? fromDate,
            DateTime? toDate,
            HttpContext httpContext
        );
        void UpdateQuery(
            int queryId,
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
            DateTime? fromDate,
            DateTime? toDate,
            HttpContext httpContext
        );
        void DeleteQuery(int queryId, HttpContext httpContext);
    }
    public sealed class QueryService : IQueryService
    {
        private readonly ITimeSlipRepository _timeSlipRepository;
        private readonly IJwtUtils _jwtUtils;
        private readonly IUserService _userService;
        private readonly IQueryRepository _queryRepository;
        private readonly IUserRepository _userRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly ILaborCodeRepository _laborCodeRepository;

        public QueryService(
            ITimeSlipRepository timeSlipRepository,
            IJwtUtils jwtUtils,
            IUserService userService,
            IQueryRepository queryRepository,
            IUserRepository userRepository,
            IProjectRepository projectRepository,
            ITaskRepository taskRepository,
            ILaborCodeRepository laborCodeRepository
        )
        {
            _timeSlipRepository = timeSlipRepository;
            _jwtUtils = jwtUtils;
            _userService = userService;
            _queryRepository = queryRepository;
            _userRepository = userRepository;
            _projectRepository = projectRepository;
            _taskRepository = taskRepository;
            _laborCodeRepository = laborCodeRepository;
        }

        public IEnumerable<Query> GetQueries(HttpContext httpContext)
        {
            int? ownerUserId = _jwtUtils.GetUserIdFromContext(httpContext);
            if (ownerUserId == null)
            {
                throw new Exception("No user currently logged in!");
            }

            return _queryRepository.Queries.Where(q => q.OwnerUserId == ownerUserId);
        }

        public TimeSlip[] QueryTimeSlips(GetTimeSlipsBody getTimeSlipsBody, HttpContext httpContext)
        {
            // Allow querying for your own time slips if not admin.
            int[]? userIds = getTimeSlipsBody.UserIds;
            if (
                userIds == null ||
                userIds.Length != 1 ||
                userIds[0] != _jwtUtils.GetUserIdFromContext(httpContext))
            {
                _userService.ValidateAccess(AccessRights.Admin, httpContext);
            }

            TimeSlip[] timeSlips = GetTimeSlips(
                getTimeSlipsBody.UserIds,
                getTimeSlipsBody.ProjectIds,
                getTimeSlipsBody.TaskIds?.Select(t => t == -1 ? (int?)null : t).ToArray(),
                getTimeSlipsBody.LaborCodeIds?.Select(l => l == -1 ? (int?)null : l).ToArray(),
                getTimeSlipsBody.FromDate,
                getTimeSlipsBody.ToDate);

            return timeSlips;
        }

        private TimeSlip[] GetTimeSlips(
            int[]? userIds,
            int[]? projectIds,
            int?[]? taskIds,
            int?[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

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

        public void AddQuery(
            string name,
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
            DateTime? fromDate,
            DateTime? toDate,
            HttpContext httpContext
        )
        {
            int? ownerUserId = _jwtUtils.GetUserIdFromContext(httpContext);
            if (ownerUserId == null)
            {
                throw new Exception("No user currently logged in!");
            }

            if (_queryRepository.Queries.Any(q => q.Name == name && q.OwnerUserId == ownerUserId))
            {
                throw new Exception($"Query with the name \"{name}\" already exists!");
            }

            if (userId.HasValue && !_userRepository.Users.Any(p => p.Id == userId.Value))
            {
                throw new Exception("User in query does not exist!");
            }

            if (projectId.HasValue && !_projectRepository.Projects.Any(p => p.Id == projectId.Value))
            {
                throw new Exception("Project in query does not exist!");
            }

            if (taskId.HasValue && !_taskRepository.Tasks.Any(p => p.Id == taskId.Value))
            {
                throw new Exception("Task in query does not exist!");
            }

            if (laborCodeId.HasValue && !_laborCodeRepository.LaborCodes.Any(p => p.Id == laborCodeId.Value))
            {
                throw new Exception("Labor code in query does not exist!");
            }

            _queryRepository.AddQuery(ownerUserId.Value, name, userId, projectId, taskId, laborCodeId, fromDate, toDate);
        }

        public void UpdateQuery(
            int queryId,
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
            DateTime? fromDate,
            DateTime? toDate,
            HttpContext httpContext
        )
        {
            int? ownerUserId = _jwtUtils.GetUserIdFromContext(httpContext);
            if (ownerUserId == null)
            {
                throw new Exception("No user currently logged in!");
            }

            if (_queryRepository.Queries.Any(q => q.Id == queryId && q.OwnerUserId != ownerUserId))
            {
                throw new Exception($"Query does not belong to current user!");
            }

            if (userId.HasValue && !_userRepository.Users.Any(p => p.Id == userId.Value))
            {
                throw new Exception("User in query does not exist!");
            }

            if (projectId.HasValue && !_projectRepository.Projects.Any(p => p.Id == projectId.Value))
            {
                throw new Exception("Project in query does not exist!");
            }

            if (taskId.HasValue && !_taskRepository.Tasks.Any(p => p.Id == taskId.Value))
            {
                throw new Exception("Task in query does not exist!");
            }

            if (laborCodeId.HasValue && !_laborCodeRepository.LaborCodes.Any(p => p.Id == laborCodeId.Value))
            {
                throw new Exception("Labor code in query does not exist!");
            }

            _queryRepository.UpdateQuery(queryId, userId, projectId, taskId, laborCodeId, fromDate, toDate);
        }

        public void DeleteQuery(int queryId, HttpContext httpContext)
        {
            int? ownerUserId = _jwtUtils.GetUserIdFromContext(httpContext);
            if (ownerUserId == null)
            {
                throw new Exception("No user currently logged in!");
            }

            if (_queryRepository.Queries.Any(q => q.Id == queryId && q.OwnerUserId != ownerUserId))
            {
                throw new Exception($"Query does not belong to current user!");
            }

            _queryRepository.DeleteQuery(queryId);
        }
    }
}
