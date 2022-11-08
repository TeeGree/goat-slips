using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.DAL
{
    public interface IFavoriteTimeSlipRepository
    {
        DbSet<FavoriteTimeSlip> FavoriteTimeSlips { get; }
        void AddFavoriteTimeSlip(FavoriteTimeSlip favoriteTimeSlip);
        void DeleteFavoriteTimeSlip(int favoriteTimeSlipId);
    }
    public sealed class FavoriteTimeSlipRepository : IFavoriteTimeSlipRepository
    {
        public DbSet<FavoriteTimeSlip> FavoriteTimeSlips
        {
            get
            {
                DbSet<FavoriteTimeSlip>? favoriteTimeSlips = _dbContext.FavoriteTimeSlips;
                if (favoriteTimeSlips == null)
                {
                    throw new Exception("No favorite time slips found!");
                }
                return favoriteTimeSlips;
            }
        }

        private readonly IGoatSlipsContext _dbContext;
        public FavoriteTimeSlipRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void AddFavoriteTimeSlip(FavoriteTimeSlip favoriteTimeSlip)
        {
            FavoriteTimeSlips.Add(favoriteTimeSlip);
            _dbContext.SaveChanges();
        }

        public void DeleteFavoriteTimeSlip(int favoriteTimeSlipId)
        {
            FavoriteTimeSlip favoriteToDelete = FavoriteTimeSlips.First(fts => fts.Id == favoriteTimeSlipId);
            FavoriteTimeSlips.Remove(favoriteToDelete);
            _dbContext.SaveChanges();
        }
    }
}
