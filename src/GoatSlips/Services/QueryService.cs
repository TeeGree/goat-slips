﻿using GoatSlips.Constants;
using GoatSlips.DAL;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using GoatSlips.Models.Database.Query;
using System.Data.Entity;

namespace GoatSlips.Services
{
    public interface IQueryService
    {
        IEnumerable<Query> GetQueries(HttpContext httpContext);
        TimeSlip[] QueryTimeSlips(GetTimeSlipsBody getTimeSlipsBody, HttpContext httpContext);
        void AddQuery(
            string name,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate,
            HttpContext httpContext
        );
        void UpdateQuery(
            int queryId,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
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

        private void ValidateUserIdsExist(int[]? userIds)
        {
            HashSet<int> userIdsSet = _userRepository.Users.Select(u => u.Id).ToHashSet();
            if (userIds != null && userIds.Any(uid => !userIdsSet.Contains(uid)))
            {
                throw new Exception("User in query does not exist!");
            }
        }

        private void ValidateProjectIdsExist(int[]? projectIds)
        {
            HashSet<int> projectIdsSet = _projectRepository.Projects.Select(p => p.Id).ToHashSet();
            if (projectIds != null && projectIds.Any(pid => !projectIdsSet.Contains(pid)))
            {
                throw new Exception("Project in query does not exist!");
            }
        }

        private void ValidateTaskIdsExist(int[]? taskIds)
        {
            HashSet<int> taskIdsSet = _taskRepository.Tasks.Select(t => t.Id).ToHashSet();
            if (taskIds != null && taskIds.Any(tid => !taskIdsSet.Contains(tid)))
            {
                throw new Exception("Task in query does not exist!");
            }
        }

        private void ValidateLaborCodeIdsExist(int[]? laborCodeIds)
        {
            HashSet<int> laborCodeIdsSet = _laborCodeRepository.LaborCodes.Select(lc => lc.Id).ToHashSet();
            if (laborCodeIds != null && laborCodeIds.Any(lcid => !laborCodeIdsSet.Contains(lcid)))
            {
                throw new Exception("Labor code in query does not exist!");
            }
        }

        public void AddQuery(
            string name,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
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

            ValidateUserIdsExist(userIds);

            ValidateProjectIdsExist(projectIds);

            ValidateTaskIdsExist(taskIds);

            ValidateLaborCodeIdsExist(laborCodeIds);

            _queryRepository.AddQuery(
                ownerUserId.Value,
                name,
                userIds,
                projectIds,
                taskIds,
                laborCodeIds,
                fromDate,
                toDate);
        }

        public void UpdateQuery(
            int queryId,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
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

            ValidateUserIdsExist(userIds);

            ValidateProjectIdsExist(projectIds);

            ValidateTaskIdsExist(taskIds);

            ValidateLaborCodeIdsExist(laborCodeIds);

            _queryRepository.UpdateQuery(queryId, userIds, projectIds, taskIds, laborCodeIds, fromDate, toDate);
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
