using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.Services.Contracts;

namespace QueryBuilder.Services.DbServices
{
    public class ServicesFactory : IServicesFactory
    {
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public ServicesFactory()
        {
            _unitOfWorkFactory = new UnitOfWorkFactory();
        }

        public IConnectionDbService GetConnectionDbService()
        {
            return new ConnectionDbService(_unitOfWorkFactory);
        }

        public IProjectService GetProjectService()
        {
            return new ProjectService(_unitOfWorkFactory);
        }

        public IProjectsShareService GetProjectsShareService()
        {
            return new ProjectsShareService(_unitOfWorkFactory);
        }

        public IQueryService GetQueryService()
        {
            return new QueryService(_unitOfWorkFactory);
        }

        public IUserService GetUserService()
        {
            return new UserService(_unitOfWorkFactory);
        }
    }
}