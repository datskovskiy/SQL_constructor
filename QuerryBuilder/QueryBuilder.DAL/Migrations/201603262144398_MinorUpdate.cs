namespace QueryBuilder.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class MinorUpdate : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Queries", "QueryName", c => c.String(maxLength: 255));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Queries", "QueryName", c => c.String(maxLength: 254));
        }
    }
}
