using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;
#pragma warning disable 0436

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