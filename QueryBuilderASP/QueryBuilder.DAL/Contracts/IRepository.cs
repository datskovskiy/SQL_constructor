using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace QueryBuilder.DAL.Contracts
{
    public interface IRepository <T> where T: class
    {
        IEnumerable<T> GetAll();

        IEnumerable<T> GetMany(Expression<Func<T, bool>> where);

        T GetById(int id);

        IEnumerable<T> Find(Func<T, bool> predicate);

        void Create(T item);

        void Update(T item);

        void Delete(int id);

        void Delete(T item);
    }
}
