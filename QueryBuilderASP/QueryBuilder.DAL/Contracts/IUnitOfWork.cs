using System;
using QueryBuilder.DAL.Repositories;
#pragma warning disable 0436

namespace QueryBuilder.DAL.Contracts
{
    public interface IUnitOfWork: IDisposable
    {
        IConnectionDBRepository ConnectionDBs { get; }
        IProjectRepository Projects { get; }
        IUsersRepository Users { get; }
        IProjectsShareRepository ProjectsShares { get; }
        IQueryRepository Queries { get; }

		IQueryHistoryRepository QueriesHistory { get; }


		void Save();
    }
}