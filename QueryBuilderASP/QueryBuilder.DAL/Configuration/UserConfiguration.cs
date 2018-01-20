using System.Data.Entity.ModelConfiguration;
using QueryBuilder.Constants.DbConstants;

namespace QueryBuilder.DAL.Configuration
{
#pragma warning disable 0436

    public class UserConfiguration : EntityTypeConfiguration<Models.ApplicationUser>
    {
        public UserConfiguration()
        {
            Property(p => p.Email).HasMaxLength(DbLengthString.LongString);
            Property(p => p.FirstName).HasMaxLength(DbLengthString.LongString);
            Property(p => p.LastName).HasMaxLength(DbLengthString.LongString);
        }
    }
}