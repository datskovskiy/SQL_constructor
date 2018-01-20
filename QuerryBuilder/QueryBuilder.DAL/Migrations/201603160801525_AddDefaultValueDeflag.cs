namespace QueryBuilder.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddDefaultValueDeflag : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Queries", "Delflag", c => c.Int(nullable: false, defaultValue: 0));
            AlterColumn("dbo.ConnectionDB", "Delflag", c => c.Int(nullable: false, defaultValue: 0));
            AlterColumn("dbo.Projects", "Delflag", c => c.Int(nullable: false, defaultValue: 0));
            AlterColumn("dbo.ProjectsShare", "Delflag", c => c.Int(nullable: false, defaultValue: 0));
            AlterColumn("dbo.Users", "Delflag", c => c.Int(nullable: false, defaultValue: 0));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Queries", "Delflag", c => c.Int(nullable: false));
            AlterColumn("dbo.ConnectionDB", "Delflag", c => c.Int(nullable: false));
            AlterColumn("dbo.Projects", "Delflag", c => c.Int(nullable: false));
            AlterColumn("dbo.ProjectsShare", "Delflag", c => c.Int(nullable: false));
            AlterColumn("dbo.Users", "Delflag", c => c.Int(nullable: false));
        }
    }
}
