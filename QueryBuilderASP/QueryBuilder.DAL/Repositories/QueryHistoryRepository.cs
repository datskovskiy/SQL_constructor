using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;
#pragma warning disable 0436

namespace QueryBuilder.DAL.Repositories
{
	public class QueryHistoryRepository: RepositoryBase<QueryHistory>, IQueryHistoryRepository
	{
		public QueryHistoryRepository(IDatabaseFactory databaseFactory) :
            base(databaseFactory)
        {
		}
	}

	public interface IQueryHistoryRepository : IRepository<QueryHistory>
	{
	}
}
