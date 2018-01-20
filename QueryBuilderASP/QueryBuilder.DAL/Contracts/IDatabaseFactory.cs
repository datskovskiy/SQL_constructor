using QueryBuilder.DAL.Contexts;
#pragma warning disable 0436

namespace QueryBuilder.DAL.Contracts
{
    public interface IDatabaseFactory
    {
        QueryBuilderContext Get();
    }
}