using System;

namespace QueryBuilderMVC.Models
{
    public class ProjectsListViewModel
    {
        public int ProjectID { get; set; }

        public string ProjectName { get; set; }

        public int Delflag { get; set; }

        public string ProjectDescription { get; set; }

        public DateTime CreatedDate { get; set; }

        public int UserRole { get; set; }

        public int CountUsersForShared { get; set; }
    }
}