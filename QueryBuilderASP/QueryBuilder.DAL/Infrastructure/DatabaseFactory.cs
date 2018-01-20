using QueryBuilder.DAL.Contexts;
using QueryBuilder.DAL.Contracts;

namespace QueryBuilder.DAL.Infrastructure
{
#pragma warning disable 0436

    public class DatabaseFactory: Disposable, IDatabaseFactory
    {
        private QueryBuilderContext _context;
        public QueryBuilderContext Get()
        {
            return _context ?? (_context = new QueryBuilderContext());
        }
        protected override void DisposeCore()
        {
            _context?.Dispose();
        }
    }
}