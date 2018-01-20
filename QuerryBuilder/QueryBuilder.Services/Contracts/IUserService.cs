using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IUserService
    {
        IEnumerable<User> GetUsers();

        User GetUserByEmail(string email);

        void CreateUser(User user);
    }
}