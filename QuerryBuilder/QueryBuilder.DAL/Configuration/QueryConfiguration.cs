using System.Data.Entity.ModelConfiguration;
using QueryBuilder.Constants.DbConstants;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.DAL.Configuration
{
    public class QueryConfiguration : EntityTypeConfiguration<Query>
    {
        public QueryConfiguration()
        {
            ToTable(DbTablesNames.Queries);
            HasKey(p => p.QueryID);
            Property(p => p.QueryName).HasMaxLength(DbLengthString.LongString);
            Property(p => p.QueryOwner).HasMaxLength(DbLengthString.LongString);
            Property(p => p.ConnectionID).IsRequired();
            Property(p => p.QueryDate).IsRequired().HasColumnType("DateTime");
            HasRequired(p => p.ConnectionDB).WithMany(p => p.Queries).HasForeignKey(p => p.ConnectionID);
        }
    }
}