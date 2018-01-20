namespace QueryBuilder.DAL.Contracts
{
#pragma warning disable 0436

    public interface IUnitOfWorkFactory
    {
        IUnitOfWork GetUnitOfWork();
    }
}