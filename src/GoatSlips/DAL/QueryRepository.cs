using GoatSlips.Models.Database;
using System.Data.Entity;
using System.Data.Entity.Migrations;

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
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
            DateTime? fromDate,
            DateTime? toDate
        );
        void UpdateQuery(
            int queryId,
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
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

        private readonly IGoatSlipsContext _dbContext;
        public QueryRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void ReleaseProjectId(int projectId)
        {
            Query[] matchingQueries = Queries.Where(q => q.ProjectId == projectId).ToArray();

            Array.ForEach(matchingQueries, query =>
            {
                query.ProjectId = null;
            });

            Queries.AddOrUpdate(matchingQueries);
            _dbContext.SaveChanges();
        }

        public void ReleaseTaskId(int taskId)
        {
            Query[] matchingQueries = Queries.Where(q => q.TaskId == taskId).ToArray();

            Array.ForEach(matchingQueries, query =>
            {
                query.TaskId = null;
            });

            Queries.AddOrUpdate(matchingQueries);
            _dbContext.SaveChanges();
        }

        public void ReleaseLaborCodeId(int laborCodeId)
        {
            Query[] matchingQueries = Queries.Where(q => q.LaborCodeId == laborCodeId).ToArray();

            Array.ForEach(matchingQueries, query =>
            {
                query.LaborCodeId = null;
            });

            Queries.AddOrUpdate(matchingQueries);
            _dbContext.SaveChanges();
        }

        public void AddQuery(
            int ownerUserId,
            string name,
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            var query = new Query
            {
                OwnerUserId = ownerUserId,
                Name = name,
                UserId = userId,
                ProjectId = projectId,
                TaskId = taskId,
                LaborCodeId = laborCodeId,
                FromDate = fromDate,
                ToDate = toDate
            };

            Queries.AddOrUpdate(query);
            _dbContext.SaveChanges();
        }

        public void UpdateQuery(
            int queryId,
            int? userId,
            int? projectId,
            int? taskId,
            int? laborCodeId,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            Query? query = Queries.FirstOrDefault(q => q.Id == queryId);

            if (query == null)
            {
                throw new Exception("Query not found!");
            }

            query.UserId = userId;
            query.ProjectId = projectId;
            query.TaskId = taskId;
            query.LaborCodeId = laborCodeId;
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

            Queries.Remove(query);
            _dbContext.SaveChanges();
        }
    }
}
