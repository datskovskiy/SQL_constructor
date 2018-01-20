using System;

namespace QueryBuilder.DAL.Models
{
    public class Query
    {
        public int QueryID { get; set; }

        public string QueryName { get; set; }

        public string QueryOwner { get; set; }

        public int ConnectionID { get; set; }

        public string QueryBody { get; set; }

        public DateTime QueryDate { get; set; }

        public byte[] QueryResult { get; set; }

        public int Delflag { get; set; }

        public virtual ConnectionDB ConnectionDB { get; set; }
    }
}
