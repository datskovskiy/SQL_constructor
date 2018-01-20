using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.DAL.Repositories
{
    public class UsersRepository : RepositoryBase<User>, IUsersRepository
    {
        public UsersRepository(IDatabaseFactory databaseFactory) :
            base(databaseFactory)
        {
        }
    }

    public interface IUsersRepository : IRepository<User>
    {
    }
}