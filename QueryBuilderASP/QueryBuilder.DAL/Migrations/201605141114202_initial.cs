namespace QueryBuilder.DAL.Migrations
{
    using System.Data.Entity.Migrations;

    public partial class initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ConnectionDB",
                c => new
                    {
                        ConnectionID = c.Int(nullable: false, identity: true),
                        ConnectionOwner = c.Int(nullable: false),
                        ConnectionName = c.String(nullable: false, maxLength: 255),
                        ServerName = c.String(nullable: false, maxLength: 255),
                        LoginDB = c.String(maxLength: 255),
                        PasswordDB = c.Binary(),
                        DatabaseName = c.String(nullable: false, maxLength: 255),
                        Delflag = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ConnectionID)
                .ForeignKey("dbo.Project", t => t.ConnectionOwner)
                .Index(t => t.ConnectionOwner);
            
            CreateTable(
                "dbo.Project",
                c => new
                    {
                        ProjectID = c.Int(nullable: false, identity: true),
                        ProjectName = c.String(nullable: false, maxLength: 255),
                        Delflag = c.Int(nullable: false),
                        ProjectDescription = c.String(maxLength: 255),
                        CreatedDate = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.ProjectID);
            
            CreateTable(
                "dbo.ProjectsShare",
                c => new
                    {
                        ProjectId = c.Int(nullable: false),
                        UserId = c.String(nullable: false, maxLength: 128),
                        FromUserId = c.String(maxLength: 128),
                        UserRole = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.ProjectId, t.UserId })
                .ForeignKey("dbo.Project", t => t.ProjectId)
                .ForeignKey("dbo.ApplicationUser", t => t.UserId)
                .Index(t => t.ProjectId)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.ApplicationUser",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Delflag = c.Int(nullable: false),
                        FirstName = c.String(maxLength: 255),
                        LastName = c.String(maxLength: 255),
                        Email = c.String(maxLength: 255),
                        EmailConfirmed = c.Boolean(nullable: false),
                        PasswordHash = c.String(),
                        SecurityStamp = c.String(),
                        PhoneNumber = c.String(),
                        PhoneNumberConfirmed = c.Boolean(nullable: false),
                        TwoFactorEnabled = c.Boolean(nullable: false),
                        LockoutEndDateUtc = c.DateTime(),
                        LockoutEnabled = c.Boolean(nullable: false),
                        AccessFailedCount = c.Int(nullable: false),
                        UserName = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.AspNetUserClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.String(),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                        ApplicationUser_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.ApplicationUser", t => t.ApplicationUser_Id)
                .Index(t => t.ApplicationUser_Id);
            
            CreateTable(
                "dbo.AspNetUserLogins",
                c => new
                    {
                        LoginProvider = c.String(nullable: false, maxLength: 128),
                        ProviderKey = c.String(nullable: false, maxLength: 128),
                        UserId = c.String(nullable: false, maxLength: 128),
                        ApplicationUser_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId })
                .ForeignKey("dbo.ApplicationUser", t => t.ApplicationUser_Id)
                .Index(t => t.ApplicationUser_Id);
            
            CreateTable(
                "dbo.AspNetUserRoles",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128),
                        RoleId = c.String(nullable: false, maxLength: 128),
                        ApplicationUser_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => new { t.UserId, t.RoleId })
                .ForeignKey("dbo.ApplicationUser", t => t.ApplicationUser_Id)
                .ForeignKey("dbo.AspNetRoles", t => t.RoleId)
                .Index(t => t.RoleId)
                .Index(t => t.ApplicationUser_Id);
            
            CreateTable(
                "dbo.Queries",
                c => new
                    {
                        QueryID = c.Int(nullable: false, identity: true),
                        QueryName = c.String(maxLength: 255),
                        ProjectID = c.Int(nullable: false),
                        UserID = c.Int(nullable: false),
                        QueryBody = c.String(),
                        Delflag = c.Int(nullable: false),
                        QueryDate = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.QueryID)
                .ForeignKey("dbo.Project", t => t.ProjectID)
                .Index(t => t.ProjectID);
            
            CreateTable(
                "dbo.QueriesHistory",
                c => new
                    {
                        QueryHistoryID = c.Int(nullable: false, identity: true),
                        UserID = c.Int(nullable: false),
                        ProjectID = c.Int(nullable: false),
                        QueryDate = c.DateTime(nullable: false),
                        QueryBody = c.String(),
                        Delflag = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.QueryHistoryID)
                .ForeignKey("dbo.Project", t => t.ProjectID)
                .Index(t => t.ProjectID);
            
            CreateTable(
                "dbo.AspNetRoles",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Name = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.Name, unique: true, name: "RoleNameIndex");
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.ConnectionDB", "ConnectionOwner", "dbo.Project");
            DropForeignKey("dbo.QueriesHistory", "ProjectID", "dbo.Project");
            DropForeignKey("dbo.Queries", "ProjectID", "dbo.Project");
            DropForeignKey("dbo.ProjectsShare", "UserId", "dbo.ApplicationUser");
            DropForeignKey("dbo.AspNetUserRoles", "ApplicationUser_Id", "dbo.ApplicationUser");
            DropForeignKey("dbo.AspNetUserLogins", "ApplicationUser_Id", "dbo.ApplicationUser");
            DropForeignKey("dbo.AspNetUserClaims", "ApplicationUser_Id", "dbo.ApplicationUser");
            DropForeignKey("dbo.ProjectsShare", "ProjectId", "dbo.Project");
            DropIndex("dbo.AspNetRoles", "RoleNameIndex");
            DropIndex("dbo.QueriesHistory", new[] { "ProjectID" });
            DropIndex("dbo.Queries", new[] { "ProjectID" });
            DropIndex("dbo.AspNetUserRoles", new[] { "ApplicationUser_Id" });
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserLogins", new[] { "ApplicationUser_Id" });
            DropIndex("dbo.AspNetUserClaims", new[] { "ApplicationUser_Id" });
            DropIndex("dbo.ProjectsShare", new[] { "UserId" });
            DropIndex("dbo.ProjectsShare", new[] { "ProjectId" });
            DropIndex("dbo.ConnectionDB", new[] { "ConnectionOwner" });
            DropTable("dbo.AspNetRoles");
            DropTable("dbo.QueriesHistory");
            DropTable("dbo.Queries");
            DropTable("dbo.AspNetUserRoles");
            DropTable("dbo.AspNetUserLogins");
            DropTable("dbo.AspNetUserClaims");
            DropTable("dbo.ApplicationUser");
            DropTable("dbo.ProjectsShare");
            DropTable("dbo.Project");
            DropTable("dbo.ConnectionDB");
        }
    }
}
