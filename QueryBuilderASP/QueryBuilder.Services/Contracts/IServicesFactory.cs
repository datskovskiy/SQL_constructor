namespace QueryBuilder.Services.Contracts
{
    public interface IServicesFactory
    {
        IUserService GetUserService();

        IConnectionDbService GetConnectionDbService();

        IProjectService GetProjectService();

        IQueryService GetQueryService();

        IProjectsShareService GetProjectsShareService();
    }
}