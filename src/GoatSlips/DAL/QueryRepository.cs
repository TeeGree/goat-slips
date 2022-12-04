using GoatSlips.Models.Database;
using GoatSlips.Models.Database.Query;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Threading.Tasks;

namespace GoatSlips.DAL
{
    public interface IQueryRepository
    {
        DbSet<Query> Queries { get; }
        void ReleaseProjectId(int projectId);
        void ReleaseTaskId(int taskId);
        void ReleaseLaborCodeId(int laborCodeId);
        void AddQuery(
            int ownerUserId,
            string name,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        );
        void UpdateQuery(
            int queryId,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        );
        void DeleteQuery(int queryId);
    }
    public sealed class QueryRepository : IQueryRepository
    {
        public DbSet<Query> Queries
        {
            get
            {
                DbSet<Query>? queries = _dbContext.Queries;
                if (queries == null)
                {
                    throw new Exception("No queries found!");
                }
                return queries;
            }
        }

        public DbSet<QueryUser> QueryUsers
        {
            get
            {
                DbSet<QueryUser>? queryUsers = _dbContext.QueryUsers;
                if (queryUsers == null)
                {
                    throw new Exception("No query users found!");
                }
                return queryUsers;
            }
        }

        public DbSet<QueryProject> QueryProjects
        {
            get
            {
                DbSet<QueryProject>? queryProjects = _dbContext.QueryProjects;
                if (queryProjects == null)
                {
                    throw new Exception("No query projects found!");
                }
                return queryProjects;
            }
        }

        public DbSet<QueryTask> QueryTasks
        {
            get
            {
                DbSet<QueryTask>? queryTasks = _dbContext.QueryTasks;
                if (queryTasks == null)
                {
                    throw new Exception("No query tasks found!");
                }
                return queryTasks;
            }
        }

        public DbSet<QueryLaborCode> QueryLaborCodes
        {
            get
            {
                DbSet<QueryLaborCode>? queryLaborCodes = _dbContext.QueryLaborCodes;
                if (queryLaborCodes == null)
                {
                    throw new Exception("No query labor codes found!");
                }
                return queryLaborCodes;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public QueryRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void ReleaseProjectId(int projectId)
        {
            QueryProject[] matchingQueryProjects = QueryProjects.Where(q => q.ProjectId == projectId).ToArray();

            QueryProjects.RemoveRange(matchingQueryProjects);
            _dbContext.SaveChanges();
        }

        public void ReleaseTaskId(int taskId)
        {
            QueryTask[] matchingQueryTasks = QueryTasks.Where(q => q.TaskId == taskId).ToArray();

            QueryTasks.RemoveRange(matchingQueryTasks);
            _dbContext.SaveChanges();
        }

        public void ReleaseLaborCodeId(int laborCodeId)
        {
            QueryLaborCode[] matchingQueryLaborCodes = QueryLaborCodes.Where(q => q.LaborCodeId == laborCodeId).ToArray();

            QueryLaborCodes.RemoveRange(matchingQueryLaborCodes);
            _dbContext.SaveChanges();
        }

        public void AddQuery(
            int ownerUserId,
            string name,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            var query = new Query
            {
                OwnerUserId = ownerUserId,
                Name = name,
                FromDate = fromDate,
                ToDate = toDate
            };

            Queries.AddOrUpdate(query);
            _dbContext.SaveChanges();

            if (userIds != null && userIds.Length > 0)
            {
                QueryUser[] queryUsers = userIds.Select(uid => new QueryUser
                {
                    QueryId = query.Id,
                    UserId = uid
                }).ToArray();

                QueryUsers.AddRange(queryUsers);
            }

            if (projectIds != null && projectIds.Length > 0)
            {
                QueryProject[] queryProjects = projectIds.Select(pid => new QueryProject
                {
                    QueryId = query.Id,
                    ProjectId = pid
                }).ToArray();

                QueryProjects.AddRange(queryProjects);
            }

            if (taskIds != null && taskIds.Length > 0)
            {
                QueryTask[] queryTasks = taskIds.Select(tid => new QueryTask
                {
                    QueryId = query.Id,
                    TaskId = tid
                }).ToArray();

                QueryTasks.AddRange(queryTasks);
            }

            if (laborCodeIds != null && laborCodeIds.Length > 0)
            {
                QueryLaborCode[] queryLaborCodes = laborCodeIds.Select(lcid => new QueryLaborCode
                {
                    QueryId = query.Id,
                    LaborCodeId = lcid
                }).ToArray();

                QueryLaborCodes.AddRange(queryLaborCodes);
            }

            _dbContext.SaveChanges();
        }

        private void RemoveUsers(int queryId)
        {
            QueryUser[] queryUsersToRemove = QueryUsers.Where(qu => qu.QueryId == queryId).ToArray();

            QueryUsers.RemoveRange(queryUsersToRemove);
        }

        private void RemoveUnusedUsers(int queryId, int[]? userIds)
        {
            if (userIds == null)
            {
                RemoveUsers(queryId);
            }
            else
            {
                var userIdsSet = userIds.ToHashSet();
                QueryUser[] queryUsersToRemove = QueryUsers.Where(qu =>
                    qu.QueryId == queryId &&
                    !userIdsSet.Contains(qu.UserId)
                ).ToArray();

                QueryUsers.RemoveRange(queryUsersToRemove);
            }
        }

        private void RemoveProjects(int queryId)
        {
            QueryProject[] queryProjectsToRemove = QueryProjects.Where(qp => qp.QueryId == queryId).ToArray();

            QueryProjects.RemoveRange(queryProjectsToRemove);
        }

        private void RemoveUnusedProjects(int queryId, int[]? projectIds)
        {
            if (projectIds == null)
            {
                RemoveProjects(queryId);
            }
            else
            {
                var projectIdsSet = projectIds.ToHashSet();
                QueryProject[] queryProjectsToRemove = QueryProjects.Where(qp =>
                    qp.QueryId == queryId &&
                    !projectIdsSet.Contains(qp.ProjectId)
                ).ToArray();

                QueryProjects.RemoveRange(queryProjectsToRemove);
            }
        }

        private void RemoveTasks(int queryId)
        {
            QueryTask[] queryTasksToRemove = QueryTasks.Where(qt => qt.QueryId == queryId).ToArray();

            QueryTasks.RemoveRange(queryTasksToRemove);
        }

        private void RemoveUnusedTasks(int queryId, int[]? taskIds)
        {
            if (taskIds == null)
            {
                RemoveTasks(queryId);
            }
            else
            {
                var taskIdsSet = taskIds.ToHashSet();
                QueryTask[] queryTasksToRemove = QueryTasks.Where(qt =>
                    qt.QueryId == queryId &&
                    !taskIdsSet.Contains(qt.TaskId)
                ).ToArray();

                QueryTasks.RemoveRange(queryTasksToRemove);
            }
        }

        private void RemoveLaborCodes(int queryId)
        {
            QueryLaborCode[] queryLaborCodesToRemove = QueryLaborCodes.Where(qlc => qlc.QueryId == queryId).ToArray();

            QueryLaborCodes.RemoveRange(queryLaborCodesToRemove);
        }

        private void RemoveUnusedLaborCodes(int queryId, int[]? laborCodeIds)
        {
            if (laborCodeIds == null)
            {
                RemoveLaborCodes(queryId);
            }
            else
            {
                var laborCodesIdsSet = laborCodeIds.ToHashSet();
                QueryLaborCode[] queryLaborCodesToRemove = QueryLaborCodes.Where(qlc =>
                    qlc.QueryId == queryId &&
                    !laborCodesIdsSet.Contains(qlc.LaborCodeId)
                ).ToArray();

                QueryLaborCodes.RemoveRange(queryLaborCodesToRemove);
            }
        }

        public void UpdateQuery(
            int queryId,
            int[]? userIds,
            int[]? projectIds,
            int[]? taskIds,
            int[]? laborCodeIds,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            Query? query = Queries.FirstOrDefault(q => q.Id == queryId);

            if (query == null)
            {
                throw new Exception("Query not found!");
            }

            RemoveUnusedUsers(queryId, userIds);
            RemoveUnusedProjects(queryId, projectIds);
            RemoveUnusedTasks(queryId, taskIds);
            RemoveUnusedLaborCodes(queryId, laborCodeIds);

            query.FromDate = fromDate;
            query.ToDate = toDate;

            Queries.AddOrUpdate(query);
            _dbContext.SaveChanges();
        }

        public void DeleteQuery(int queryId)
        {
            Query? query = Queries.FirstOrDefault(q => q.Id == queryId);

            if (query == null)
            {
                throw new Exception("Query not found!");
            }

            RemoveUsers(queryId);
            RemoveProjects(queryId);
            RemoveTasks(queryId);
            RemoveLaborCodes(queryId);
            _dbContext.SaveChanges();

            Queries.Remove(query);
            _dbContext.SaveChanges();
        }
    }
}
