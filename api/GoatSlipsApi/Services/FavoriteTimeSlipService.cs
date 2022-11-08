using GoatSlipsApi.DAL;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Models.Database;

namespace GoatSlipsApi.Services
{
    public interface IFavoriteTimeSlipService
    {
        void DeleteFavoriteTimeSlip(int favoriteTimeSlipId);
        void AddFavoriteTimeSlip(HttpContext httpContext, string name, int projectId, int? taskId, int? laborCodeId);
        IEnumerable<FavoriteTimeSlip> GetFavoriteTimeSlipsForCurrentUser(HttpContext httpContext);
    }
    public sealed class FavoriteTimeSlipService : IFavoriteTimeSlipService
    {
        private readonly IJwtUtils _jwtUtils;
        private readonly IFavoriteTimeSlipRepository _favoriteTimeSlipRepository;
        public FavoriteTimeSlipService(
            IJwtUtils jwtUtils,
            IFavoriteTimeSlipRepository favoriteTimeSlipRepository
        )
        {
            _jwtUtils = jwtUtils;
            _favoriteTimeSlipRepository = favoriteTimeSlipRepository;
        }

        public void DeleteFavoriteTimeSlip(int favoriteTimeSlipId)
        {
            _favoriteTimeSlipRepository.DeleteFavoriteTimeSlip(favoriteTimeSlipId);
        }

        public void AddFavoriteTimeSlip(HttpContext httpContext, string name, int projectId, int? taskId, int? laborCodeId)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);

            if (userId == null)
            {
                throw new Exception("No user in context.");
            }

            bool isDuplicateFavorite = _favoriteTimeSlipRepository.FavoriteTimeSlips.Any(fts =>
                fts.ProjectId == projectId &&
                fts.TaskId == taskId &&
                fts.LaborCodeId == laborCodeId &&
                fts.UserId == userId
            );

            if (isDuplicateFavorite)
            {
                throw new DuplicateFavoriteException("Favorite already exists for this combination of time codes!");
            }

            _favoriteTimeSlipRepository.AddFavoriteTimeSlip(new FavoriteTimeSlip
            {
                Name = name,
                ProjectId = projectId,
                TaskId = taskId,
                LaborCodeId = laborCodeId,
                UserId = userId.Value
            });
        }

        public IEnumerable<FavoriteTimeSlip> GetFavoriteTimeSlipsForCurrentUser(HttpContext httpContext)
        {
            int? userId = _jwtUtils.GetUserIdFromContext(httpContext);

            if (userId == null)
            {
                throw new Exception("No user in context.");
            }

            return _favoriteTimeSlipRepository.FavoriteTimeSlips.Where(fts => fts.UserId == userId);
        }
    }
}
