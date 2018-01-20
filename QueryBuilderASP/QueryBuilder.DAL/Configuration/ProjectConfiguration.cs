using System.Data.Entity.ModelConfiguration;
using QueryBuilder.Constants.DbConstants;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.DAL.Configuration
{
#pragma warning disable 0436

    public class ProjectConfiguration : EntityTypeConfiguration<Project>
    {
        public ProjectConfiguration()
        {
            HasKey(p => p.ProjectID);
            Property(p => p.ProjectName).IsRequired().HasMaxLength(DbLengthString.LongString);
            Property(p => p.ProjectDescription).HasMaxLength(DbLengthString.LongString);
            Property(g => g.CreatedDate).IsRequired();
        }
    }
}