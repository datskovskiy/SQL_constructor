using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.DAL.Repositories
{
    public class QueriesRepository : RepositoryBase<Query>, IQueryRepository
    {
        public QueriesRepository(IDatabaseFactory databaseFactory) :
            base(databaseFactory)
        {
        }
    }

    public interface IQueryRepository : IRepository<Query>
    {
    }
}