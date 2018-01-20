namespace QueryBuilder.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ModifiedTableQueries : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Queries", "QueryBody", c => c.String());
            AddColumn("dbo.Queries", "QueryDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Queries", "QueryResult", c => c.Binary());
            DropColumn("dbo.Queries", "ResultBody");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Queries", "ResultBody", c => c.String(maxLength: 255));
            DropColumn("dbo.Queries", "QueryResult");
            DropColumn("dbo.Queries", "QueryDate");
            DropColumn("dbo.Queries", "QueryBody");
        }
    }
}
