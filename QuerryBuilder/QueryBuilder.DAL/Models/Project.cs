using System.Collections.Generic;

namespace QueryBuilder.DAL.Models
{
    public class Project
    {
        public int ProjectID { get; set; }

        public string ProjectName { get; set; }

        public string ProjectOwner { get; set; }

        public int Delflag { get; set; }

        public string ProjectDescription { get; set; }

        public virtual ICollection<ConnectionDB> ConnectionDBs { get; set; }

        public virtual User Users { get; set; }

        public virtual ICollection<ProjectsShare> ProjectsShares { get; set; }

        public Project()
        {
            ConnectionDBs = new HashSet<ConnectionDB>();
            ProjectsShares = new HashSet<ProjectsShare>();
        }
    }
}
