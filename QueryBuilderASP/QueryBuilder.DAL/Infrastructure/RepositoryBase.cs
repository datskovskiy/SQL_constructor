using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using QueryBuilder.DAL.Contexts;
using QueryBuilder.DAL.Contracts;

namespace QueryBuilder.DAL.Infrastructure
{
#pragma warning disable 0436

    public abstract class RepositoryBase<T> where T: class 
    {
        private QueryBuilderContext _context;
        private readonly IDbSet<T> _dbSet;

        protected IDatabaseFactory DatabaseFactory { get; }

        public QueryBuilderContext QueryBuilderContext
        {
            get { return _context ?? (_context = DatabaseFactory.Get()); }
        }

        protected RepositoryBase(IDatabaseFactory databaseFactory)
        {
            DatabaseFactory = databaseFactory;
            _dbSet = QueryBuilderContext.Set<T>();
        }

        public virtual IEnumerable<T> GetAll()
        {
            return _dbSet.ToList();
        }

        public virtual IEnumerable<T> GetMany(Expression<Func<T, bool>> where)
        {
            return _dbSet.Where(where).ToList();
        }

        public virtual T GetById(int id)
        {
            return _dbSet.Find(id);
        }

        public virtual IEnumerable<T> Find(Func<T, bool> predicate)
        {
            return _dbSet.Where(predicate).ToList();
        }

        public virtual void Create(T item)
        {
            _dbSet.Add(item);
        }

        public virtual void Update(T item)
        {
            _dbSet.Attach(item);
            _context.Entry(item).State = EntityState.Modified;
        }

        public virtual void Delete(int id)
        {
            var temp = _dbSet.Find(id);
            if (temp != null) _dbSet.Remove(temp);
        }

        public virtual void Delete(T item)
        {
            _dbSet.Remove(item);
        }
    }
}