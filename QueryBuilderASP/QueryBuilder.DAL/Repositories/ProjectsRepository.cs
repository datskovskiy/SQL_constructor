using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Models;
#pragma warning disable 0436

namespace QueryBuilder.DAL.Repositories
{
    public class ProjectsRepository : RepositoryBase<Project>, IProjectRepository
    {
        public ProjectsRepository(IDatabaseFactory databaseFactory): 
            base(databaseFactory)
        {          
        }
    }

    public interface IProjectRepository : IRepository<Project>
    {
    }
}
