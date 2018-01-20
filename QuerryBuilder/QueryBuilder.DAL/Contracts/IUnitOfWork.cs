using System;
using QueryBuilder.DAL.Repositories;

namespace QueryBuilder.DAL.Contracts
{
    public interface IUnitOfWork: IDisposable
    {
        IConnectionDBRepository ConnectionDBs { get; }
        IProjectRepository Projects { get; }
        IUsersRepository Users { get; }
        IProjectsShareRepository ProjectsShares { get; }
        IQueryRepository Queries { get; }

        void Save();
    }
}