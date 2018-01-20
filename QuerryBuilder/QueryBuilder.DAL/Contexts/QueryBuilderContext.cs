using QueryBuilder.DAL.Configuration;
using System.Data.Entity;
using QueryBuilder.DAL.Models;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace QueryBuilder.DAL.Contexts
{
    public class QueryBuilderContext : DbContext
    {
        public QueryBuilderContext()
            : base("name=QueryBuilderDB")
        {
        }

        public DbSet<ConnectionDB> ConnectionDBs { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectsShare> ProjectsShares { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Query> Queries { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
            modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();

            modelBuilder.Configurations.Add(new ConnectionDbConfiguration());
            modelBuilder.Configurations.Add(new ProjectConfiguration());
            modelBuilder.Configurations.Add(new QueryConfiguration());
            modelBuilder.Configurations.Add(new UserConfiguration());
            modelBuilder.Configurations.Add(new ProjectsShareConfiguration());
            //modelBuilder.Entity<ConnectionDB>()
            //    .HasMany(e => e.ResultHistories)
            //    .WithRequired(e => e.ConnectionDB)
            //    .WillCascadeOnDelete(false);

            //modelBuilder.Entity<Project>()
            //    .HasMany(e => e.ConnectionDBs)
            //    .WithRequired(e => e.Project)
            //    .HasForeignKey(e => e.ConnectionOwner)
            //    .WillCascadeOnDelete(false);

            //modelBuilder.Entity<Project>()
            //    .HasMany(e => e.ProjectsShares)
            //    .WithRequired(e => e.Project)
            //    .WillCascadeOnDelete(false);

            //modelBuilder.Entity<User>()
            //    .HasMany(e => e.Projects)
            //    .WithRequired(e => e.User)
            //    .HasForeignKey(e => e.ProjectOwner)
            //    .WillCascadeOnDelete(false);

            //modelBuilder.Entity<ResultHistory>()
            //    .Property(e => e.ResultBody)
            //    .IsUnicode(false);
        }
    }
}
