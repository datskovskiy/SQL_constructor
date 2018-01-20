using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;
using QueryBuilder.Constants.DbConstants;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.DAL.Configuration
{
    public class ConnectionDbConfiguration : EntityTypeConfiguration<ConnectionDB>
    {
        public ConnectionDbConfiguration()
        {
            ToTable(DbTablesNames.ConnectionDb);
            HasKey(p => p.ConnectionID);
            Property(p => p.ConnectionID).HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
            Property(p => p.ConnectionOwner).IsRequired();
            Property(p => p.ConnectionName).IsRequired().HasMaxLength(DbLengthString.LongString);
            Property(p => p.ServerName).IsRequired().HasMaxLength(DbLengthString.LongString);
            Property(p => p.LoginDB).HasMaxLength(DbLengthString.LongString);
            Property(p => p.DatabaseName).IsRequired().HasMaxLength(DbLengthString.LongString);
            HasRequired(p => p.Project).WithMany(p => p.ConnectionDBs).HasForeignKey(p => p.ConnectionOwner);
        }
    }
}