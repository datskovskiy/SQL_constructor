using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IQueriesHistoryService
	{
        IEnumerable<QueryHistory> GetQueriesHistory();

        void AddQueryHistory(QueryHistory query);

		void SaveQueryHistory(QueryHistory query);

		void DeleteQueryHistory(int id);

		IEnumerable<QueryHistory> GetQueriesHistory(int owner);

		QueryHistory GetQueryHistory(int id);


	}
}