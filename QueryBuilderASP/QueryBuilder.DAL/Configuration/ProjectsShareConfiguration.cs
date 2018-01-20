using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;
using QueryBuilder.Constants.DbConstants;
using QueryBuilder.DAL.Models;

#pragma warning disable 0436

namespace QueryBuilder.DAL.Configuration
{
    public class ProjectsShareConfiguration : EntityTypeConfiguration<ProjectsShare>
    {
        public ProjectsShareConfiguration()
        {
            ToTable(DbTablesNames.ProjectsShare);
            HasKey(p => new { p.ProjectId, p.UserId });
            Property(p => p.ProjectId).HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
            Property(p => p.UserId).HasMaxLength(DbLengthString.NormalString);
            Property(p => p.FromUserId).HasMaxLength(DbLengthString.NormalString);
            HasRequired(p => p.Project).WithMany(p => p.ProjectsShares).HasForeignKey(p => p.ProjectId);
            HasRequired(p => p.User).WithMany(p => p.ProjectsShares).HasForeignKey(p => p.UserId);
        }
    }
}