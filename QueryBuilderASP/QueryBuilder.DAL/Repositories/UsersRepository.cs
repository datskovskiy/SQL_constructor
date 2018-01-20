using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.DAL.Repositories
{
#pragma warning disable 0436

    public class UsersRepository : RepositoryBase<ApplicationUser>, IUsersRepository
    {
        public UsersRepository(IDatabaseFactory databaseFactory) :
            base(databaseFactory)
        {
        }
    }

    public interface IUsersRepository : IRepository<ApplicationUser>
    {
    }
}