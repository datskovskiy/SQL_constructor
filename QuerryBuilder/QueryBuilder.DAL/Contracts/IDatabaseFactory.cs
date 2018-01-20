using QueryBuilder.DAL.Contexts;

namespace QueryBuilder.DAL.Contracts
{
    public interface IDatabaseFactory
    {
        QueryBuilderContext Get();
    }
}