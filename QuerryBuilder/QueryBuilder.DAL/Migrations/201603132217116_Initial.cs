namespace QueryBuilder.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ConnectionDB",
                c => new
                    {
                        ConnectionID = c.Int(nullable: false),
                        ConnectionOwner = c.Int(nullable: false),
                        ConnectionName = c.String(nullable: false, maxLength: 255),
                        ServerName = c.String(nullable: false, maxLength: 255),
                        LoginDB = c.String(maxLength: 255),
                        PasswordDB = c.Guid(),
                        DatabaseName = c.String(nullable: false, maxLength: 255),
                        Delflag = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ConnectionID)
                .ForeignKey("dbo.Projects", t => t.ConnectionOwner)
                .Index(t => t.ConnectionOwner);
            
            CreateTable(
                "dbo.Projects",
                c => new
                    {
                        ProjectID = c.Int(nullable: false, identity: true),
                        ProjectName = c.String(nullable: false, maxLength: 255),
                        ProjectOwner = c.String(nullable: false, maxLength: 255),
                        Delflag = c.Int(nullable: false),
                        ProjectDescription = c.String(maxLength: 255),
                    })
                .PrimaryKey(t => t.ProjectID)
                .ForeignKey("dbo.Users", t => t.ProjectOwner)
                .Index(t => t.ProjectOwner);
            
            CreateTable(
                "dbo.ProjectsShare",
                c => new
                    {
                        ProjectID = c.Int(nullable: false),
                        SharedEmail = c.String(nullable: false, maxLength: 255),
                        Delflag = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.ProjectID, t.SharedEmail })
                .ForeignKey("dbo.Projects", t => t.ProjectID)
                .Index(t => t.ProjectID);
            
            CreateTable(
                "dbo.Users",
                c => new
                    {
                        Email = c.String(nullable: false, maxLength: 255),
                        PasswordHash = c.Guid(nullable: false),
                        Delflag = c.Int(nullable: false),
                        FirstName = c.String(nullable: false, maxLength: 255),
                        LastName = c.String(nullable: false, maxLength: 255),
                    })
                .PrimaryKey(t => t.Email);
            
            CreateTable(
                "dbo.Queries",
                c => new
                    {
                        QueryID = c.Int(nullable: false, identity: true),
                        QueryName = c.String(maxLength: 255),
                        QueryOwner = c.String(maxLength: 255),
                        ConnectionID = c.Int(nullable: false),
                        ResultBody = c.String(maxLength: 255),
                        Delflag = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.QueryID)
                .ForeignKey("dbo.ConnectionDB", t => t.ConnectionID)
                .Index(t => t.ConnectionID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Queries", "ConnectionID", "dbo.ConnectionDB");
            DropForeignKey("dbo.Projects", "ProjectOwner", "dbo.Users");
            DropForeignKey("dbo.ProjectsShare", "ProjectID", "dbo.Projects");
            DropForeignKey("dbo.ConnectionDB", "ConnectionOwner", "dbo.Projects");
            DropIndex("dbo.Queries", new[] { "ConnectionID" });
            DropIndex("dbo.ProjectsShare", new[] { "ProjectID" });
            DropIndex("dbo.Projects", new[] { "ProjectOwner" });
            DropIndex("dbo.ConnectionDB", new[] { "ConnectionOwner" });
            DropTable("dbo.Queries");
            DropTable("dbo.Users");
            DropTable("dbo.ProjectsShare");
            DropTable("dbo.Projects");
            DropTable("dbo.ConnectionDB");
        }
    }
}
