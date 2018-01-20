using System.Data.Entity.ModelConfiguration;
using QueryBuilder.Constants.DbConstants;
using QueryBuilder.DAL.Models;
#pragma warning disable 0436

namespace QueryBuilder.DAL.Configuration
{
	public class QueryHistoryConfiguration : EntityTypeConfiguration<QueryHistory>
	{
		public QueryHistoryConfiguration()
		{
			ToTable(DbTablesNames.QueriesHistory);
			HasKey(p => p.QueryHistoryID);
			Property(p => p.UserID).IsRequired();
			Property(p => p.ProjectID).IsRequired();
			Property(p => p.QueryDate).IsRequired().HasColumnType("DateTime");
			HasRequired(p => p.Project).WithMany(p => p.QueriesHistory).HasForeignKey(p => p.ProjectID);
		}

	}
}
