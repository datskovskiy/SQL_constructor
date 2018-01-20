using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;
#pragma warning disable 0436

namespace QueryBuilder.DAL.Repositories
{
    public class ProjectsShareRepository : RepositoryBase<ProjectsShare>, IProjectsShareRepository
    {
        public ProjectsShareRepository(IDatabaseFactory databaseFactory) :
            base(databaseFactory)
        {
        }
    }

    public interface IProjectsShareRepository : IRepository<ProjectsShare>
    {
    }
}