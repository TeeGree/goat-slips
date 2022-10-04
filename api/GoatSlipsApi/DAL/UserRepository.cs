﻿using GoatSlipsApi.Models.Database;
using System.Data.Entity;

namespace GoatSlipsApi.DAL
{
    public interface IUserRepository
    {
        User? GetById(int id);
        User? GetByUsername(string username);
        IEnumerable<User> GetAllUsers();
    }
    public sealed class UserRepository : IUserRepository
    {
        private readonly IGoatSlipsContext _dbContext;
        public UserRepository(IGoatSlipsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public User? GetById(int id)
        {
            return _dbContext.Users?.FirstOrDefault(u => u.Id == id);
        }

        public User? GetByUsername(string username)
        {
            return _dbContext.Users?.FirstOrDefault(u => u.Username == username);
        }

        public IEnumerable<User> GetAllUsers()
        {
            DbSet<User>? users = _dbContext.Users;
            if (users == null)
            {
                throw new Exception("No users found!");
            }
            return users;
        }
    }
}
