using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IUserService
    {
        IEnumerable<ApplicationUser> GetUsers();

        ApplicationUser GetUserByEmail(string email);

        void CreateUser(ApplicationUser user);
        ApplicationUser GetUserByID(string id);

    }
}