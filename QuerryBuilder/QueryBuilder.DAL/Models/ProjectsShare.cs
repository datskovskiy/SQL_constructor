namespace QueryBuilder.DAL.Models
{
    public class ProjectsShare
    {
        public int ProjectID { get; set; }

        public string SharedEmail { get; set; }

        public int Delflag { get; set; }

        public virtual Project Project { get; set; }
    }
}
