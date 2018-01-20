using System.Data.Entity.ModelConfiguration;
using QueryBuilder.Constants.DbConstants;
using QueryBuilder.DAL.Models;
#pragma warning disable 0436

namespace QueryBuilder.DAL.Configuration
{
    public class QueryConfiguration : EntityTypeConfiguration<Query>
    {
        public QueryConfiguration()
        {
            ToTable(DbTablesNames.Queries);
            HasKey(p => p.QueryID);
            Property(p => p.QueryName).HasMaxLength(DbLengthString.LongString);
            Property(p => p.UserID).IsRequired();
			Property(p => p.ProjectID).IsRequired();
            Property(p => p.QueryDate).IsRequired().HasColumnType("DateTime");
            HasRequired(p => p.Project).WithMany(p => p.Queries).HasForeignKey(p => p.ProjectID);
        }
    }
}