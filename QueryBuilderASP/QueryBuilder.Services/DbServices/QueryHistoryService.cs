using System;
using System.Collections.Generic;
using QueryBuilder.Constants;
using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Models;
using QueryBuilder.Services.Contracts;

namespace QueryBuilder.Services.DbServices
{
    public class QueryHistoryService: IQueriesHistoryService
	{
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public QueryHistoryService(IUnitOfWorkFactory unitOfWorkFactory)
        {
            _unitOfWorkFactory = unitOfWorkFactory;
        }

        public void AddQueryHistory(QueryHistory queryHistory)
        {
            if (queryHistory == null)
            {
                throw new ArgumentNullException(nameof(queryHistory));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                unitOfWork.QueriesHistory.Create(queryHistory);
                unitOfWork.Save();
            }
        }

        public IEnumerable<QueryHistory> GetQueriesHistory()
        {
            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.QueriesHistory.GetMany(p => p.Delflag == DelflagConstants.ActiveSet);
            }
        }

		public void SaveQueryHistory(QueryHistory queryHistory)
		{
			if (queryHistory == null)
			{
				throw new ArgumentNullException(nameof(queryHistory));
			}

			using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
			{
				if (queryHistory.QueryHistoryID == 0)
					unitOfWork.QueriesHistory.Create(queryHistory);
				else
					unitOfWork.QueriesHistory.Update(queryHistory);

				unitOfWork.Save();
			}
		}

		public void DeleteQueryHistory(int id)
		{
			using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
			{
				unitOfWork.QueriesHistory.Delete(id);

				unitOfWork.Save();
			}
		}

		public IEnumerable<QueryHistory> GetQueriesHistory(int owner)
		{
			using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
			{
				return unitOfWork.QueriesHistory.GetMany(p => p.Delflag == DelflagConstants.ActiveSet && p.ProjectID == owner);
			}
		}

		public QueryHistory GetQueryHistory(int id)
		{
			using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
			{
				return unitOfWork.QueriesHistory.GetById(id);
			}
		}



	}
}