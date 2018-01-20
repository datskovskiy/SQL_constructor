namespace QueryBuilder.DAL.Contracts
{
    public interface IUnitOfWorkFactory
    {
        IUnitOfWork GetUnitOfWork();
    }
}