using QueryBuilder.DAL.Contracts;

namespace QueryBuilder.DAL.Infrastructure
{
#pragma warning disable 0436

    public class UnitOfWorkFactory : IUnitOfWorkFactory
    {
        public IUnitOfWork GetUnitOfWork()
        {
            var context = new DatabaseFactory();
            return new UnitOfWork(context);
        }
    }
}