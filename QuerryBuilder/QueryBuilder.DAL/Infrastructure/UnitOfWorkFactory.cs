using System;
using QueryBuilder.DAL.Contracts;

namespace QueryBuilder.DAL.Infrastructure
{
    public class UnitOfWorkFactory : IUnitOfWorkFactory
    {
        public IUnitOfWork GetUnitOfWork()
        {
            var context = new DatabaseFactory();
            return new UnitOfWork(context);
        }
    }
}