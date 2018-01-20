using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IQueryService
    {
        IEnumerable<Query> GetQueries();

        void CreateQuery(Query query);
    }
}