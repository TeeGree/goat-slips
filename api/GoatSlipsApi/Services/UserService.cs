﻿using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;

namespace GoatSlipsApi.Services
{
    public interface IUserService
    {
        User? GetById(int id);
        User? GetByUsername(string username);
    }
    public sealed class UserService : IUserService
    {
        private readonly IGoatSlipsContext _goatSlipsContext;
        public UserService(IGoatSlipsContext goatSlipsContext)
        {
            _goatSlipsContext = goatSlipsContext;
        }

        public User? GetById(int id)
        {
            return _goatSlipsContext.Users?.FirstOrDefault(u => u.Id == id);
        }

        public User? GetByUsername(string username)
        {
            return _goatSlipsContext.Users?.FirstOrDefault(u => u.Username == username);
        }
    }
}
