using System;
using System.Collections.Generic;
using QueryBuilder.Constants;
using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Models;
using QueryBuilder.Services.Contracts;

namespace QueryBuilder.Services.DbServices
{
    public class QueryService: IQueryService
    {
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public QueryService(IUnitOfWorkFactory unitOfWorkFactory)
        {
            _unitOfWorkFactory = unitOfWorkFactory;
        }

        public void CreateQuery(Query query)
        {
            if (query == null)
            {
                throw new ArgumentNullException(nameof(query));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                unitOfWork.Queries.Create(query);
                unitOfWork.Save();
            }
        }

        public IEnumerable<Query> GetQueries()
        {
            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.Queries.GetMany(p => p.Delflag == DelflagConstants.ActiveSet);
            }
        }
    }
}