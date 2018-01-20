using QueryBuilder.DAL.Configuration;
using System.Data.Entity;
using QueryBuilder.DAL.Models;
using System.Data.Entity.ModelConfiguration.Conventions;
using Microsoft.AspNet.Identity.EntityFramework;

namespace QueryBuilder.DAL.Contexts
{
#pragma warning disable 0436

    public class QueryBuilderContext : IdentityDbContext<ApplicationUser>
    {
        public QueryBuilderContext()
            : base("name=DefaultConnection", throwIfV1Schema: false)
        {
            //Database.SetInitializer(new DropCreateDatabaseAlways<QueryBuilderContext>());
            //Database.SetInitializer<QueryBuilderContext>(null);
            //Configuration.ProxyCreationEnabled = false;
            //Configuration.LazyLoadingEnabled = false;
        }

        public DbSet<ConnectionDB> ConnectionDBs { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectsShare> ProjectsShares { get; set; }
        //public DbSet<ApplicationUser> Users { get; set; }
        public DbSet<Query> Queries { get; set; }
		public DbSet<QueryHistory> QueriesHistory { get; set; }

		protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //modelBuilder.Entity<IdentityUserLogin>().HasKey<string>(l => l.UserId);
            //modelBuilder.Entity<IdentityRole>().HasKey<string>(r => r.Id);
            //modelBuilder.Entity<IdentityUserRole>().HasKey(r => new { r.RoleId, r.UserId });
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
            modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();

            modelBuilder.Configurations.Add(new ConnectionDbConfiguration());
            modelBuilder.Configurations.Add(new ProjectConfiguration());
            modelBuilder.Configurations.Add(new QueryConfiguration());
            modelBuilder.Configurations.Add(new UserConfiguration());
            modelBuilder.Configurations.Add(new ProjectsShareConfiguration());
			modelBuilder.Configurations.Add(new QueryHistoryConfiguration());
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
        public static QueryBuilderContext Create()
        {
            return new QueryBuilderContext();
        }
    }
}
