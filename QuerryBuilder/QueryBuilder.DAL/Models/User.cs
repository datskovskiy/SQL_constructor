using System;
using System.Collections.Generic;

namespace QueryBuilder.DAL.Models
{
    public class User
    {
        public string Email { get; set; }

        public Guid PasswordHash { get; set; }

        public int Delflag { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public virtual ICollection<Project> Projects { get; set; }

        public User()
        {
            Projects = new HashSet<Project>();
        }
    }
}
