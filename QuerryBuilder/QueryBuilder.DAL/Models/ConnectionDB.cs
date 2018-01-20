using System;
using System.Collections.Generic;

namespace QueryBuilder.DAL.Models
{
    public class ConnectionDB
    {
        public int ConnectionID { get; set; }

        public int ConnectionOwner { get; set; }

        public string ConnectionName { get; set; }

        public string ServerName { get; set; }

        public string LoginDB { get; set; }

        public Guid? PasswordDB { get; set; }

        public string DatabaseName { get; set; }

        public int Delflag { get; set; }

        public virtual Project Project { get; set; }

        public virtual ICollection<Query> Queries { get; set; }

        public ConnectionDB()
        {
            Queries = new HashSet<Query>();
        }
    }
}
