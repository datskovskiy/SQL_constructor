using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.DAL.Repositories
{
    public class ConnectionDBRepository : RepositoryBase<ConnectionDB>, IConnectionDBRepository
    {
        public ConnectionDBRepository(IDatabaseFactory databaseFactory) 
            :base(databaseFactory)
        {
        }
    }

    public interface IConnectionDBRepository : IRepository<ConnectionDB>
    {
    }
}
